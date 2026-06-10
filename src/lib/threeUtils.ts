import * as THREE from 'three';

export class HelixCurve extends THREE.Curve<THREE.Vector3> {
  constructor(public radius = 0.5, public height = 1.5, public turns = 6) { super(); }
  getPoint(t: number, optionalTarget = new THREE.Vector3()): THREE.Vector3 {
    const angle = t * Math.PI * 2 * this.turns;
    return optionalTarget.set(Math.cos(angle) * this.radius, (t - 0.5) * this.height, Math.sin(angle) * this.radius);
  }
}

export const exportSceneToDXF = (scene: THREE.Scene) => {
  let dxf = `0\nSECTION\n2\nENTITIES\n`;
  scene.traverse((child: any) => {
    if (child.isMesh && child.geometry) {
      try {
        let geom = child.geometry.clone();
        child.updateWorldMatrix(true, false);
        geom.applyMatrix4(child.matrixWorld);
        if (geom.index) geom = geom.toNonIndexed();
        const pos = geom.attributes.position;
        if (!pos) return;
        for (let i = 0; i < pos.count; i += 3) {
          const v1 = new THREE.Vector3().fromBufferAttribute(pos, i);
          const v2 = new THREE.Vector3().fromBufferAttribute(pos, i+1);
          const v3 = new THREE.Vector3().fromBufferAttribute(pos, i+2);
          dxf += `0\n3DFACE\n8\nMesh\n`;
          dxf += `10\n${v1.x.toFixed(4)}\n20\n${v1.y.toFixed(4)}\n30\n${v1.z.toFixed(4)}\n`;
          dxf += `11\n${v2.x.toFixed(4)}\n21\n${v2.y.toFixed(4)}\n31\n${v2.z.toFixed(4)}\n`;
          dxf += `12\n${v3.x.toFixed(4)}\n22\n${v3.y.toFixed(4)}\n32\n${v3.z.toFixed(4)}\n`;
          dxf += `13\n${v3.x.toFixed(4)}\n23\n${v3.y.toFixed(4)}\n33\n${v3.z.toFixed(4)}\n`;
        }
      } catch (e) {
        console.error('Error exporting mesh to DXF', e);
      }
    }
  });
  dxf += `0\nENDSEC\n0\nEOF\n`;

  const blob = new Blob([dxf], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `gan-3d-model-${Date.now()}.dxf`;
  a.click();
  URL.revokeObjectURL(url);
};
