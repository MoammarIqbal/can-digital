import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface InfiniteTemplesProps {
  modelPath: string;
  playerZ: React.MutableRefObject<number>;
}

type SourcePart = {
  geometry: THREE.BufferGeometry;
  material: THREE.Material;
};

// Neat cluster layout configuration
const CLUSTER_SPACING = 38.0;
const TOTAL_CLUSTERS = 10;
const CLUSTERS_BEHIND = 3;
const TEMPLES_PER_CLUSTER = 12; // 5 left + 5 right + 2 roadside gates
const TOTAL_INSTANCES = TOTAL_CLUSTERS * TEMPLES_PER_CLUSTER;

export function InfiniteTemples({ modelPath, playerZ }: InfiniteTemplesProps) {
  const { scene } = useGLTF(modelPath);
  const refs = useRef<Array<THREE.InstancedMesh | null>>([]);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Extract and normalize geometries and materials from temple.glb
  const parts = useMemo<SourcePart[]>(() => {
    scene.updateMatrixWorld(true);

    const sourceMeshes: THREE.Mesh[] = [];
    scene.traverse((object) => {
      if ((object as THREE.Mesh).isMesh) {
        sourceMeshes.push(object as THREE.Mesh);
      }
    });

    if (sourceMeshes.length === 0) return [];

    const worldGeometries = sourceMeshes.map((mesh) => {
      const geometry = mesh.geometry.clone();
      geometry.applyMatrix4(mesh.matrixWorld);
      geometry.computeBoundingBox();
      return { geometry, material: mesh.material as THREE.Material };
    });

    const bounds = new THREE.Box3();
    for (const item of worldGeometries) {
      if (item.geometry.boundingBox) bounds.union(item.geometry.boundingBox);
    }

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    bounds.getSize(size);
    bounds.getCenter(center);

    // Normalize height to approximately 3.4 world units, rooted cleanly at y = 0
    const scale = 3.4 / Math.max(size.y, size.x, size.z, 0.001);
    const normalize = new THREE.Matrix4()
      .makeScale(scale, scale, scale)
      .multiply(new THREE.Matrix4().makeTranslation(-center.x, -bounds.min.y, -center.z));

    return worldGeometries.map(({ geometry, material }) => {
      geometry.applyMatrix4(normalize);
      geometry.computeVertexNormals();
      return { geometry, material };
    });
  }, [scene]);

  useEffect(() => {
    return () => {
      parts.forEach((part) => part.geometry.dispose());
    };
  }, [parts]);

  useFrame(() => {
    const pz = playerZ.current;
    const baseCluster = Math.floor(pz / CLUSTER_SPACING);

    refs.current.forEach((mesh) => {
      if (!mesh) return;

      let instanceIdx = 0;

      for (let c = 0; c < TOTAL_CLUSTERS; c++) {
        const worldCluster = baseCluster - CLUSTERS_BEHIND + c;
        const centerZ = worldCluster * CLUSTER_SPACING;

        // === 1. KLASTER KIRI (LEFT TEMPLE CLUSTER) ===
        const leftCenterX = -17.5;

        // Candi Induk (Grand Sanctuary in center of left cluster)
        dummy.position.set(leftCenterX, 0.25, centerZ);
        dummy.rotation.set(0, Math.PI / 2, 0); // Angled towards the main avenue
        dummy.scale.setScalar(2.3);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // Candi Perwara 1: Front-Inner (near avenue)
        dummy.position.set(-8.8, 0, centerZ - 9.0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // Candi Perwara 2: Front-Outer
        dummy.position.set(-25.5, 0, centerZ - 9.0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // Candi Perwara 3: Rear-Inner (near avenue)
        dummy.position.set(-8.8, 0, centerZ + 9.0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // Candi Perwara 4: Rear-Outer
        dummy.position.set(-25.5, 0, centerZ + 9.0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // === 2. KLASTER KANAN (RIGHT TEMPLE CLUSTER) ===
        const rightCenterX = 17.5;

        // Candi Induk (Grand Sanctuary in center of right cluster)
        dummy.position.set(rightCenterX, 0.25, centerZ);
        dummy.rotation.set(0, -Math.PI / 2, 0); // Angled towards main avenue
        dummy.scale.setScalar(2.3);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // Candi Perwara 1: Front-Inner (near avenue)
        dummy.position.set(8.8, 0, centerZ - 9.0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // Candi Perwara 2: Front-Outer
        dummy.position.set(25.5, 0, centerZ - 9.0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // Candi Perwara 3: Rear-Inner (near avenue)
        dummy.position.set(8.8, 0, centerZ + 9.0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // Candi Perwara 4: Rear-Outer
        dummy.position.set(25.5, 0, centerZ + 9.0);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(1.2);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // === 3. CANDI APIT / GAPURA PENJAGA JALAN (AVENUE GATEWAY SHRINES) ===
        // Symmetrically placed shrines marking the entrance threshold between clusters
        const gateZ = centerZ - CLUSTER_SPACING / 2;

        // Left Gate Shrine
        dummy.position.set(-6.2, 0, gateZ);
        dummy.rotation.set(0, Math.PI / 2, 0);
        dummy.scale.setScalar(0.95);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);

        // Right Gate Shrine
        dummy.position.set(6.2, 0, gateZ);
        dummy.rotation.set(0, -Math.PI / 2, 0);
        dummy.scale.setScalar(0.95);
        dummy.updateMatrix();
        mesh.setMatrixAt(instanceIdx++, dummy.matrix);
      }

      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  if (parts.length === 0) return null;

  return (
    <group>
      {parts.map((part, index) => (
        <instancedMesh
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          args={[part.geometry, part.material, TOTAL_INSTANCES]}
          castShadow
          receiveShadow
          frustumCulled={false}
        />
      ))}
    </group>
  );
}

useGLTF.preload("/models/temple.glb");
