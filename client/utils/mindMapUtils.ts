import { Node, Edge } from 'reactflow';
import dagre from 'dagre';

export interface MindMapData {
    nodes: Array<{
        id: string;
        label: string;
        type?: 'topic' | 'subtopic' | 'concept';
        description?: string;
    }>;
    edges: Array<{
        source: string;
        target: string;
        label?: string;
    }>;
}

// Convert AI-generated mindmap data to React Flow format with auto-layout
export function convertToReactFlow(data: MindMapData): { nodes: Node[]; edges: Edge[] } {
    // Create dagre graph for automatic layout
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    dagreGraph.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 60 });

    // Convert nodes
    const nodes: Node[] = data.nodes.map((node) => ({
        id: node.id,
        type: node.type || 'default',
        data: { label: node.label, description: node.description },
        position: { x: 0, y: 0 }, // Will be calculated by dagre
    }));

    // Add nodes to dagre
    nodes.forEach((node) => {
        const width = node.type === 'topic' ? 200 : node.type === 'subtopic' ? 170 : 140;
        const height = 80;
        dagreGraph.setNode(node.id, { width, height });
    });

    // Convert edges
    const edges: Edge[] = data.edges.map((edge, index) => ({
        id: `e${edge.source}-${edge.target}-${index}`,
        source: edge.source,
        target: edge.target,
        label: edge.label,
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
    }));

    // Add edges to dagre
    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    // Calculate layout
    dagre.layout(dagreGraph);

    // Apply calculated positions to nodes
    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - (nodeWithPosition.width / 2),
                y: nodeWithPosition.y - (nodeWithPosition.height / 2),
            },
        };
    });

    return { nodes: layoutedNodes, edges };
}

// Parse AI response text to extract mindmap JSON
export function parseAIMindMapResponse(text: string): MindMapData | null {
    try {
        // Try to extract JSON from markdown code block
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/);
        const jsonText = jsonMatch ? jsonMatch[1] : text;

        const parsed = JSON.parse(jsonText.trim());

        // Validate structure
        if (parsed.nodes && parsed.edges && Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
            return parsed as MindMapData;
        }

        return null;
    } catch (error) {
        console.error('Failed to parse AI mindmap response:', error);
        return null;
    }
}

// Generate sample mindmap for testing/fallback
export function generateSampleMindMap(topic: string): MindMapData {
    return {
        nodes: [
            { id: '1', label: topic, type: 'topic' },
            { id: '2', label: 'Core Concept 1', type: 'subtopic' },
            { id: '3', label: 'Core Concept 2', type: 'subtopic' },
            { id: '4', label: 'Core Concept 3', type: 'subtopic' },
            { id: '5', label: 'Detail A', type: 'concept' },
            { id: '6', label: 'Detail B', type: 'concept' },
            { id: '7', label: 'Detail C', type: 'concept' },
            { id: '8', label: 'Detail D', type: 'concept' },
        ],
        edges: [
            { source: '1', target: '2' },
            { source: '1', target: '3' },
            { source: '1', target: '4' },
            { source: '2', target: '5' },
            { source: '2', target: '6' },
            { source: '3', target: '7' },
            { source: '4', target: '8' },
        ],
    };
}
