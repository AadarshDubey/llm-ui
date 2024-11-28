import React, { useState, useRef } from 'react';
import { AlertCircle, GripHorizontal, Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const NodeTypes = {
  INPUT: 'input',
  LLM: 'llm',
  OUTPUT: 'output'
};

const NodeIcons = {
  [NodeTypes.INPUT]: {
    logo: "/input.svg"
  },
  [NodeTypes.LLM]: {
    logo: "/llm.svg"
  },
  [NodeTypes.OUTPUT]: {
    logo: "/output.svg"
  }
};

const FloatingAlert = ({ message, onClose }) => {
  return (
    <div className="fixed top-4 mt-14 right-4 z-50 flex items-center bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg animate-in fade-in slide-in-from-top-4">
      <AlertCircle className="h-5 w-5 mr-2" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-4">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

const ConnectionDot = ({ position, onClick, type }) => {
  return (
    <div
      className={`absolute w-2 h-2 rounded-full bg-blue-500 cursor-pointer hover:w-3 hover:h-3 transition-all duration-200
        ${position === 'right' ? 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2' : 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2'}`}
      onClick={onClick}
    >
      <div className="absolute -inset-2" />
    </div>
  );
};

const WorkflowNode = ({ 
  type, 
  data, 
  position, 
  onPositionChange, 
  onDataChange, 
  isConnecting, 
  startConnection, 
  endConnection,
  hasError,
  errorMessage 
}) => {
  const nodeRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const {logo } = NodeIcons[type];

  const handleDragStart = (e) => {
    setIsDragging(true);
    const rect = nodeRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.dataTransfer.setData('text/plain', type);
  };

  const handleDrag = (e) => {
    if (!isDragging || !e.clientX) return;
    
    const x = e.clientX - dragOffset.x;
    const y = e.clientY - dragOffset.y;
    onPositionChange({ x, y });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getNodeContent = () => {
    switch (type) {
      case NodeTypes.INPUT:
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-500 mb-2">
              Write the input/question you want to ask
            </div>
            <Label>Input</Label>
            <textarea
              value={data.query || ''}
              onChange={(e) => onDataChange({ query: e.target.value })}
              className={`w-full p-2 border rounded-md ${hasError ? 'border-red-500' : ''}`}
              placeholder="Type Something..."
              rows={3}
            />
          </div>
        );
      case NodeTypes.LLM:
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-500 mb-2">
              Lorem ipsum sic dolar amet
            </div>
            <Label>Model Name</Label>
            <select
              value={data.model || 'gpt-3.5-turbo'}
              onChange={(e) => onDataChange({ model: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="gpt-3.5-turbo">GPT-3.5</option>
              <option value="gpt-4">GPT-4</option>
            </select>

            <Label>OpenAI API Base</Label>
            <Input
              type="text"
              value={data.apiBase || ''}
              onChange={(e) => onDataChange({ apiBase: e.target.value })}
              placeholder="type something"
              className={hasError ? 'border-red-500' : ''}
            />

            <Label>OpenAI Key</Label>
            <Input
              type="password"
              value={data.apiKey || ''}
              onChange={(e) => onDataChange({ apiKey: e.target.value })}
              placeholder="type something"
              className={hasError ? 'border-red-500' : ''}
            />

            <Label>Max Tokens</Label>
            <Input
              type="number"
              value={data.maxTokens || 2000}
              onChange={(e) => onDataChange({ maxTokens: parseInt(e.target.value) })}
              placeholder="type something"
              min="1"
              max="32000"
              className={hasError ? 'border-red-500' : ''}
            />

            <Label>Temperature</Label>
            <Input
              type="number"
              value={data.temperature || 0.5}
              onChange={(e) => onDataChange({ temperature: parseFloat(e.target.value) })}
              placeholder="0.5"
              step="0.1"
              min="0"
              max="2"
              className={hasError ? 'border-red-500' : ''}
            />
          </div>
        );
      case NodeTypes.OUTPUT:
        return (
          <div className="space-y-2">
            <div className="text-sm text-gray-500 mb-2">
              Lorem ipsum sic dolar amet
            </div>
            <Label>Output Response</Label>
            <div className="p-2 border rounded-md min-h-[100px] bg-gray-50">
              {data.output || 'Output Response will be shown here'}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <Card
        ref={nodeRef}
        draggable
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={`absolute p-4 w-80 cursor-move ${hasError ? 'border-red-500' : ''}`}
        style={{
          left: position.x,
          top: position.y,
          opacity: isDragging ? 0.7 : 1,
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt={`${type} logo`} className="w-5 h-5" />
            <h3 className="font-semibold">{type.toUpperCase()}</h3>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <GripHorizontal className="w-4 h-4" />
          </button>
        </div>
        
        {getNodeContent()}

        {type !== NodeTypes.OUTPUT && (
          <ConnectionDot
            position="right"
            onClick={() => startConnection(type)}
            type={type}
          />
        )}
        
        {type !== NodeTypes.INPUT && (
          <ConnectionDot
            position="left"
            onClick={() => endConnection(type)}
            type={type}
          />
        )}
      </Card>
    </div>
  );
};

const WorkflowBuilder = () => {
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStart, setConnectionStart] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [tempLine, setTempLine] = useState(null);

  const addNode = (type) => {
    const newNode = {
      id: `${type}-${Date.now()}`,
      type,
      position: { x: 300, y: 100 },
      data: type === NodeTypes.LLM ? {
        model: 'gpt-3.5-turbo',
        maxTokens: 2000,
        temperature: 0.5,
        apiBase: 'https://api.openai.com/v1'
      } : {},
    };
    setNodes([...nodes, newNode]);
  };

  const updateNodePosition = (nodeId, newPosition) => {
    setNodes(nodes.map(node => 
      node.id === nodeId ? { ...node, position: newPosition } : node
    ));
  };

  const updateNodeData = (nodeId, newData) => {
    setNodes(nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
    ));
    setError('');
    setErrorType('');
    setShowAlert(false);
  };

  const startConnection = (nodeId) => {
    setIsConnecting(true);
    setConnectionStart(nodeId);
  };

  const endConnection = (nodeId) => {
    if (isConnecting && connectionStart !== nodeId) {
      setConnections([...connections, {
        source: connectionStart,
        target: nodeId
      }]);
    }
    setIsConnecting(false);
    setConnectionStart(null);
    setTempLine(null);
  };

  React.useEffect(() => {
    const handleMouseMove = (e) => {
      if (isConnecting) {
        const sourceNode = nodes.find(n => n.id === connectionStart);
        if (sourceNode) {
          const startX = sourceNode.position.x + 320; 
          const startY = sourceNode.position.y + 40;
          setTempLine({
            x1: startX,
            y1: startY,
            x2: e.clientX - 72, 
            y2: e.clientY - 56  
          });
        }
      }
    };

    if (isConnecting) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isConnecting, connectionStart, nodes]);

  const executeWorkflow = async () => {
    try {
      setError('');
      setErrorType('');
      setShowAlert(false);
      
      const inputNode = nodes.find(n => n.type === NodeTypes.INPUT);
      const llmNode = nodes.find(n => n.type === NodeTypes.LLM);
      const outputNode = nodes.find(n => n.type === NodeTypes.OUTPUT);

      if (!inputNode?.data.query) {
        setError('Error while running the flow ');
        setErrorType('input');
        setShowAlert(true);
        return;
      }

      if (!llmNode?.data.apiKey) {
        setError('LLM is missing API key');
        setErrorType('llm');
        setShowAlert(true);
        return;
      }

      const apiBase = llmNode.data.apiBase || 'https://api.openai.com/v1';
      const response = await fetch(`${apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${llmNode.data.apiKey}`,
        },
        body: JSON.stringify({
          model: llmNode.data.model || 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: inputNode.data.query }],
          max_tokens: llmNode.data.maxTokens || 2000,
          temperature: llmNode.data.temperature || 0.5,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from OpenAI');
      }

      const data = await response.json();
      const output = data.choices[0].message.content;

      setNodes(nodes.map(node =>
        node.type === NodeTypes.OUTPUT
          ? { ...node, data: { ...node.data, output } }
          : node
      ));
    } catch (err) {
      setError(err.message);
      setErrorType('general');
      setShowAlert(true);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {showAlert && (
        <FloatingAlert 
          message={error}
          onClose={() => setShowAlert(false)}

        
        />
      )}
       

       <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b px-4 py-1 flex justify-between items-center h-[60px]">
  <div className="flex items-center">
    <div className="flex justify-center items-center h-full">
      <img src="/FF.svg" alt="Logo" className="h-[120px]  w-[120px] object-contain"  />
    </div>
    <span className="font-bold text-[18px] mt-1">FlowForge</span>
  </div>
  <Button 
    onClick={executeWorkflow}
    className="bg-green-600 mr-4 rounded-tl-lg w-[78px] h-[31px] p-[7px_15px] gap-1 hover:bg-green-700"
  >
    <Play className="w-4 h-4 mr-[5px]" />
    Run
  </Button>
</nav>

      <div className="flex mt-14 h-full">
        <Card className="fixed left-7 top-20 bottom-5 w-64 shadow-lg z-40 flex flex-col">
          <div className="p-4">
            <div className="font-semibold mb-4  ">Components</div>
            <div className="space-y-2.5">
            <Button
  onClick={() => addNode(NodeTypes.INPUT)}
  className="w-full justify-start gap-2"
  variant="outline"
>
  <img src="/input.svg" alt="Input" className="w-5 h-5" />
  Input Node
</Button>
<Button
  onClick={() => addNode(NodeTypes.LLM)}
  className="w-full justify-start gap-2"
  variant="outline"
>
  <img src="/llm.svg" alt="LLM" className="w-5 h-5" />
  LLM Node
</Button>
<Button
  onClick={() => addNode(NodeTypes.OUTPUT)}
  className="w-full justify-start gap-2"
  variant="outline"
>
  <img src="/output.svg" alt="Output" className="w-5 h-5" />
  Output Node
</Button>
            </div>
          </div>
          <div className="flex-1"></div>
        </Card>

        <div className="flex-1 p-4 ml-72 bg-white bg-dots-grid bg-dots-size">
          {nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              type={node.type}
              data={node.data}
              position={node.position}
              onPositionChange={(newPos) => updateNodePosition(node.id, newPos)}
              onDataChange={(newData) => updateNodeData(node.id, newData)}
              isConnecting={isConnecting}
              startConnection={() => startConnection(node.id)}
              endConnection={() => endConnection(node.id)}
              hasError={errorType === node.type.toLowerCase()}
              errorMessage={errorType === node.type.toLowerCase() ? error : ''}
            />
          ))}
          
          {connections.map((connection, index) => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);
            
            if (!sourceNode || !targetNode) return null;

            const startX = sourceNode.position.x + 256;
            const startY = sourceNode.position.y + 40;
            const endX = targetNode.position.x;
            const endY = targetNode.position.y + 40;

            return (
              <svg
                key={index}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                style={{ zIndex: -1 }}
              >
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#2563eb"
                  strokeWidth="2"
                />
              </svg>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;