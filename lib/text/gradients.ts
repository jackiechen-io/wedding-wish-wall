export type Gradient = {
  id: string;
  name: string;
  startColor: string;
  endColor: string;
  angle: number;
};

export const GRADIENTS: Gradient[] = [
  { id: 'pink', name: '淺粉', startColor: '#FCE4EC', endColor: '#FFFFFF', angle: 135 },
  { id: 'blue', name: '淺藍', startColor: '#E3F2FD', endColor: '#FFFFFF', angle: 135 },
  { id: 'purple', name: '淺紫', startColor: '#F3E5F5', endColor: '#FFFFFF', angle: 135 },
  { id: 'mint', name: '淺薄荷', startColor: '#E0F2F1', endColor: '#FFFFFF', angle: 135 },
  { id: 'yellow', name: '淺黃', startColor: '#FFFDE7', endColor: '#FFFFFF', angle: 135 },
  { id: 'coral', name: '淺珊瑚', startColor: '#FBE9E7', endColor: '#FFFFFF', angle: 135 },
  { id: 'lavender', name: '薰衣草', startColor: '#EDE7F6', endColor: '#FFFFFF', angle: 135 },
  { id: 'peach', name: '蜜桃', startColor: '#FFF3E0', endColor: '#FFFFFF', angle: 135 },
];

export function getCssGradient(g: Gradient): string {
  return `linear-gradient(${g.angle}deg, ${g.startColor}, ${g.endColor})`;
}
