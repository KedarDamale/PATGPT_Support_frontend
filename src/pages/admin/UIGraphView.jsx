import { useState, useEffect, useCallback } from "react";
import { uiGraphApi } from "../../api";
import { 
    ReactFlow, Controls, Background, MiniMap,
    applyNodeChanges, applyEdgeChanges
} from "@xyflow/react";
import '@xyflow/react/dist/style.css'; 
import { X, Edit2, Plus, LayoutTemplate, Link as LinkIcon, Save, Trash2 } from "lucide-react";

export default function UIGraphView() {
    // Canvas State
    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sidebar / Editor state
    const [selectedElement, setSelectedElement] = useState(null); // { type: 'node' | 'edge', data: backendData }
    const [isEditing, setIsEditing] = useState(false);
    
    // Creation State
    const [isCreating, setIsCreating] = useState(null); // 'node' | 'edge' | null
    const [form, setForm] = useState({});

    const fetchGraph = async () => {
        setLoading(true);
        try {
            const [fetchedNodes, fetchedEdges] = await Promise.all([
                uiGraphApi.getNodes(),
                uiGraphApi.getEdges()
            ]);
            
            const uiNodes = fetchedNodes.map((n, i) => {
                const cols = 5;
                const x = (i % cols) * 280;
                const y = Math.floor(i / cols) * 160;
                
                return {
                    id: String(n.id),
                    position: { x, y },
                    data: { label: n.node_name, backendData: n },
                    type: "default",
                    style: {
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '16px',
                        fontSize: '14px',
                        color: '#111827',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        width: '200px',
                        wordBreak: 'break-word'
                    }
                };
            });

            const uiEdges = fetchedEdges.map(e => ({
                id: String(e.id),
                source: String(e.from_node),
                target: String(e.to_node),
                label: e.action, 
                data: { backendData: e },
                animated: true,
                style: { stroke: '#16a37a', strokeWidth: 2 }
            }));

            setNodes(uiNodes);
            setEdges(uiEdges);
        } catch (err) {
            console.error("Failed to fetch graph data", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGraph();
    }, []);

    const onNodesChange = useCallback(
        (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
        []
    );
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );

    const onNodeClick = (_, node) => {
        setSelectedElement({ type: 'node', data: node.data.backendData });
        setIsEditing(false);
        setIsCreating(null);
    };

    const onEdgeClick = (_, edge) => {
        setSelectedElement({ type: 'edge', data: edge.data.backendData });
        setIsEditing(false);
        setIsCreating(null);
    };

    const openCreateNode = () => {
        setIsCreating('node');
        setSelectedElement(null);
        setIsEditing(false);
        setForm({
            id: `node_${Date.now()}`,
            node_name: "",
            node_type: "page",
            node_info: "",
            tags: [],
            scroll_count: 1
        });
    };

    const openCreateEdge = () => {
        setIsCreating('edge');
        setSelectedElement(null);
        setIsEditing(false);
        setForm({
            id: `edge_${Date.now()}`,
            from_node: nodes[0]?.id || "",
            to_node: nodes[0]?.id || "",
            action: "click",
            weight: 1
        });
    };

    const openEdit = () => {
        if (!selectedElement) return;
        setIsEditing(true);
        setForm({ ...selectedElement.data });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isCreating === 'node') {
                await uiGraphApi.createNode(form);
            } else if (isCreating === 'edge') {
                await uiGraphApi.createEdge(form);
            } else if (isEditing && selectedElement) {
                if (selectedElement.type === 'node') {
                    // Update endpoint only supports node_name, node_info, tags, scroll_count
                    await uiGraphApi.updateNode(selectedElement.data.id, {
                        node_name: form.node_name,
                        node_info: form.node_info,
                        tags: form.tags,
                        scroll_count: form.scroll_count
                    });
                } else {
                    // Edge update only supports weight and action
                    await uiGraphApi.updateEdge(selectedElement.data.id, {
                        weight: form.weight,
                        action: form.action
                    });
                }
            }
            await fetchGraph(); 
            setIsEditing(false);
            setIsCreating(null);
            setSelectedElement(null);
        } catch (err) {
            console.error("Failed to save or update element", err);
            alert(err.response?.data?.detail ? JSON.stringify(err.response.data.detail) : "Error saving");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this element?")) return;
        try {
            if (selectedElement.type === 'node') {
                await uiGraphApi.deleteNode(selectedElement.data.id);
            } else {
                await uiGraphApi.deleteEdge(selectedElement.data.id);
            }
            await fetchGraph();
            setSelectedElement(null);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to delete element", err);
            alert("Delete failed");
        }
    };

    // Close panel
    const closePanel = () => {
        setSelectedElement(null);
        setIsEditing(false);
        setIsCreating(null);
    };

    // Parse Comma separated Tags for Form
    const handleTagsChange = (val) => {
        const arr = val.split(',').map(t => t.trim()).filter(Boolean);
        setForm({ ...form, tags: arr });
    };

    return (
        <div className="flex w-full h-full relative overflow-hidden bg-gray-50 dark:bg-[#0d1117]">
            {/* Top Toolbar (Floating inside graph view) */}
            <div className="absolute top-4 left-4 z-10 flex gap-3 shadow-md rounded-xl bg-white/90 dark:bg-[#161b22]/90 backdrop-blur-md border border-gray-200 dark:border-white/10 p-2">
                <button 
                    onClick={openCreateNode} 
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-[#16a37a]/10 text-[#16a37a] hover:bg-[#16a37a]/20 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Node
                </button>
                <button 
                    onClick={openCreateEdge} 
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                >
                    <Plus className="w-4 h-4" /> Edge
                </button>
            </div>

            {/* Main Graph Canvas */}
            <div className="flex-1 h-full relative z-0">
                {loading && nodes.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                         <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-white/10 border-t-[#16a37a] animate-spin" />
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onNodeClick={onNodeClick}
                        onEdgeClick={onEdgeClick}
                        fitView
                        className="dark-theme"
                    >
                        <Background color="#ccc" gap={20} size={1.5} />
                        <Controls className="bg-white dark:bg-[#161b22] dark:border-white/10 fill-gray-600 dark:fill-gray-300 shadow-lg" />
                        <MiniMap 
                            nodeStrokeColor="#16a37a"
                            nodeColor="#ffffff"
                            maskColor="rgba(0,0,0, 0.1)"
                            className="border border-gray-200 dark:border-white/10 bg-white dark:bg-[#161b22]"
                        />
                    </ReactFlow>
                )}
            </div>

            {/* Right Sidebar Editor / Metadata Panel */}
            {(selectedElement || isCreating) && (
                <div className="w-96 bg-white dark:bg-[#161b22] border-l border-gray-200 dark:border-white/10 flex flex-col shadow-[0_0_40px_-15px_rgba(0,0,0,0.3)] z-20 absolute right-0 top-0 bottom-0 animate-fade-in shrink-0">
                    <div className="p-6 border-b border-gray-200 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
                        <div className="overflow-hidden pr-4 flex-1">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-lg">
                                {isCreating === 'node' || selectedElement?.type === 'node' ? (
                                    <LayoutTemplate className="w-5 h-5 text-[#16a37a]" />
                                ) : (
                                    <LinkIcon className="w-5 h-5 text-blue-500" />
                                )}
                                {isCreating ? `Create New ${isCreating === 'node' ? 'Node' : 'Edge'}` : `${selectedElement?.type === 'node' ? 'Node' : 'Edge'} Details`}
                            </h3>
                            {selectedElement && (
                                <p className="text-[11px] font-mono text-gray-500 truncate mt-1">ID: {selectedElement.data.id}</p>
                            )}
                        </div>
                        <button onClick={closePanel} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-auto p-6">
                        {(!isEditing && !isCreating) ? (
                            <div className="space-y-6">
                                {/* ---- METADATA READ-ONLY VIEW ---- */}
                                {selectedElement.type === 'node' ? (
                                    <>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Name</span>
                                            <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold bg-gray-50 dark:bg-white/5 p-3.5 rounded-xl border border-gray-100 dark:border-white/10">
                                                {selectedElement.data.node_name}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Info</span>
                                            <div className="text-sm text-gray-800 dark:text-gray-300 bg-gray-50 dark:bg-white/5 p-3.5 rounded-xl border border-gray-100 dark:border-white/10 min-h-[100px] whitespace-pre-wrap">
                                                {selectedElement.data.node_info}
                                            </div>
                                        </div>
                                         <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Type</span>
                                                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-xl border border-gray-100 dark:border-white/10">
                                                    {selectedElement.data.node_type}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Scrolls</span>
                                                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium bg-gray-50 dark:bg-white/5 px-3 py-2 rounded-xl border border-gray-100 dark:border-white/10">
                                                    {selectedElement.data.scroll_count}
                                                </div>
                                            </div>
                                        </div>
                                        {selectedElement.data.tags?.length > 0 && (
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Tags</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedElement.data.tags.map(tag => (
                                                        <span key={tag} className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-[#16a37a]/15 text-[#16a37a] dark:bg-[#16a37a]/20 dark:text-[#16a37a] rounded-lg">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                ) : ( // READ-ONLY EDGE
                                    <>
                                        <div className="flex gap-4 items-center justify-between pb-6 border-b border-gray-100 dark:border-white/10">
                                            <div className="flex-1 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 text-center">
                                                <span className="text-[9px] text-gray-400 uppercase block font-bold tracking-widest mb-1.5">Source</span>
                                                <span className="text-xs font-mono text-gray-700 dark:text-gray-300 font-semibold truncate block">{selectedElement.data.from_node}</span>
                                            </div>
                                            <div className="text-gray-300 bg-gray-100 dark:bg-white/5 p-2 rounded-full border border-gray-200 dark:border-white/10">
                                                <LinkIcon className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <div className="flex-1 bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10 text-center">
                                                <span className="text-[9px] text-gray-400 uppercase block font-bold tracking-widest mb-1.5">Target</span>
                                                <span className="text-xs font-mono text-gray-700 dark:text-gray-300 font-semibold truncate block">{selectedElement.data.to_node}</span>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Action</span>
                                                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/10">
                                                    {selectedElement.data.action}
                                                </div>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Weight</span>
                                                <div className="text-sm text-gray-800 dark:text-gray-200 font-medium bg-gray-50 dark:bg-white/5 p-3 rounded-xl border border-gray-100 dark:border-white/10">
                                                    {selectedElement.data.weight}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Read-Only Action Buttons */}
                                <div className="pt-6 mt-8 border-t border-gray-200 dark:border-white/10 flex gap-3">
                                    <button onClick={openEdit} className="flex-1 flex justify-center items-center gap-2 bg-[#16a37a] hover:bg-[#0f8463] text-white py-3 rounded-xl text-sm font-semibold shadow-[0_4px_14px_0_rgba(22,163,122,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,122,0.23)] hover:-translate-y-0.5 transition-all">
                                        <Edit2 className="w-4 h-4" /> Edit
                                    </button>
                                    <button onClick={handleDelete} className="flex-1 flex justify-center items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 py-3 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5">
                                        <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // ---- EDIT / CREATE FORM ----
                            <form onSubmit={handleSave} className="space-y-5 animate-fade-in">
                                {((isCreating === 'node') || (isEditing && selectedElement?.type === 'node')) ? (
                                    <>
                                        {isCreating === 'node' && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Node ID</label>
                                                    <input 
                                                        required className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a] font-mono"
                                                        value={form.id || ''} onChange={e => setForm({...form, id: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Type</label>
                                                    <select 
                                                        required className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]"
                                                        value={form.node_type || 'page'} onChange={e => setForm({...form, node_type: e.target.value})}
                                                    >
                                                        <option value="page">Page</option>
                                                        <option value="button">Button</option>
                                                        <option value="link">Link</option>
                                                        <option value="form">Form</option>
                                                        <option value="input">Input</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Name</label>
                                            <input 
                                                required className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]"
                                                value={form.node_name || ''} onChange={e => setForm({...form, node_name: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Info / Content</label>
                                            <textarea 
                                                rows={5} required className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a] resize-none leading-relaxed"
                                                value={form.node_info || ''} onChange={e => setForm({...form, node_info: e.target.value})}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Scrolls</label>
                                                <input 
                                                    type="number" min={1} max={10} required className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]"
                                                    value={form.scroll_count || ''} onChange={e => setForm({...form, scroll_count: parseInt(e.target.value, 10)})}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Tags (csv)</label>
                                                <input 
                                                    className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]"
                                                    placeholder="tag1, tag2"
                                                    value={(form.tags || []).join(', ')} onChange={e => handleTagsChange(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : ( // EDGE FORM
                                    <>
                                        {isCreating === 'edge' && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Edge ID</label>
                                                    <input 
                                                        required className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a] font-mono"
                                                        value={form.id || ''} onChange={e => setForm({...form, id: e.target.value})}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 dark:bg-white/[0.02] dark:border-white/10">
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Source Node ID</label>
                                                        <select 
                                                            required className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a] font-mono text-xs"
                                                            value={form.from_node || ''} onChange={e => setForm({...form, from_node: e.target.value})}
                                                        >
                                                            {nodes.map(n => <option key={n.id} value={n.id}>{n.id} ({n.data.label})</option>)}
                                                        </select>
                                                    </div>
                                                    <div className="flex justify-center -my-3 relative z-10"><LinkIcon className="w-5 h-5 text-gray-300 bg-white dark:bg-[#161b22] px-1" /></div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Target Node ID</label>
                                                        <select 
                                                            required className="w-full bg-white dark:bg-[#161b22] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a] font-mono text-xs"
                                                            value={form.to_node || ''} onChange={e => setForm({...form, to_node: e.target.value})}
                                                        >
                                                            {nodes.map(n => <option key={n.id} value={n.id}>{n.id} ({n.data.label})</option>)}
                                                        </select>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Action</label>
                                            <select 
                                                required className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]"
                                                value={form.action || ''} onChange={e => setForm({...form, action: e.target.value})}
                                            >
                                                <option value="click">click</option>
                                                <option value="type">type</option>
                                                <option value="select">select</option>
                                                <option value="check">check</option>
                                                <option value="scroll">scroll</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest dark:text-gray-400 mb-1.5">Weight</label>
                                            <input 
                                                type="number" min={1} max={10} required className="w-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#16a37a]"
                                                value={form.weight || ''} onChange={e => setForm({...form, weight: parseInt(e.target.value, 10)})}
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="pt-6 mt-8 border-t border-gray-200 dark:border-white/10 flex gap-3">
                                    <button type="button" onClick={() => { setIsEditing(false); setIsCreating(null); }} className="flex-1 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition-all hover:-translate-y-0.5">
                                        Cancel
                                    </button>
                                    <button type="submit" className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl font-semibold text-white bg-[#16a37a] hover:bg-[#0f8463] shadow-[0_4px_14px_0_rgba(22,163,122,0.39)] hover:shadow-[0_6px_20px_rgba(22,163,122,0.23)] hover:-translate-y-0.5 transition-all">
                                        <Save className="w-4 h-4" /> {isCreating ? 'Create' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
