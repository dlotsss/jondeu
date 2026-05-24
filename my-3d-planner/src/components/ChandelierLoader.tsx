import { useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import { usePlannerStore } from '@/store/usePlannerStore';
import type { ChandelierPlacement } from '@/store/usePlannerStore';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

const MODEL_TARGET_HEIGHT = 0.9;

function ActualChandelier({ file }: { file: string }) {
  const { scene } = useGLTF(`/models/${file}`);
  
  const { clonedScene, modelOffset, modelScale } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3();
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    const meshBox = new THREE.Box3();
    let hasMeshes = false;

    clone.updateMatrixWorld(true);

    clone.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      meshBox.setFromObject(mesh);
      if (!meshBox.isEmpty()) {
        box.union(meshBox);
        hasMeshes = true;
      }
    });

    if (!hasMeshes || box.isEmpty()) {
      box.setFromObject(clone);
    }

    box.getCenter(center);
    box.getSize(size);

    const verticalSize = size.y || Math.max(size.x, size.z, 1);
    const scale = MODEL_TARGET_HEIGHT / verticalSize;

    // Center the model on X/Z and place its top at local Y=0 so it hangs down from the cable.
    const offset = new THREE.Vector3(
      -center.x * scale,
      -box.max.y * scale,
      -center.z * scale,
    );

    return { clonedScene: clone, modelOffset: offset, modelScale: scale };
  }, [scene]);

  useMemo(() => {
    clonedScene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Improve materials for crystal/glass parts
        if (mesh.name.toLowerCase().includes('crystal') || mesh.name.toLowerCase().includes('glass')) {
          mesh.material = new THREE.MeshPhysicalMaterial({
            transmission: 1.0,
            thickness: 0.15,
            roughness: 0.0,
            ior: 1.52,
          });
        }
      }
    });
  }, [clonedScene]);

  return (
    <group position={[0, 2.34, 0]}>
      <primitive
        key={file}
        object={clonedScene}
        scale={modelScale}
        position={modelOffset}
      />
    </group>
  );
}

function PlacedChandelier({ placement }: { placement: ChandelierPlacement }) {
  const groupRef = useRef<THREE.Group>(null);

  const suspensionElements = (
    <group position={[placement.x, 0, placement.z]}>
      <mesh position={[0, 2.68, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 16]} />
        <meshStandardMaterial color="#222222" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 2.45, 0]} castShadow>
        <cylinderGeometry args={[0.004, 0.004, 0.42, 8]} />
        <meshStandardMaterial color="#111111" metalness={0.8} roughness={0.2} />
      </mesh>
      <pointLight
        position={[0, 2.2, 0]}
        intensity={1.35}
        distance={5}
        decay={2}
        color="#ffeacc"
        castShadow
      />
    </group>
  );

  if (placement.chandelier.file) {
    return (
      <group ref={groupRef}>
        {suspensionElements}
        <group position={[placement.x, 0, placement.z]}>
          <ActualChandelier key={placement.chandelier.file} file={placement.chandelier.file} />
        </group>
      </group>
    );
  }

  return (
    <group ref={groupRef} dispose={null}>
      {suspensionElements}
      <group position={[placement.x, 2.2, placement.z]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.4]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.25, 32, 32]} />
          <MeshTransmissionMaterial
            thickness={0.2}
            roughness={0.0}
            transmission={1.0}
            ior={1.52}
            chromaticAberration={0.05}
            backside={true}
          />
        </mesh>
      </group>
    </group>
  );
}

export default function ChandelierLoader() {
  const { chandelierPlacements } = usePlannerStore();

  if (chandelierPlacements.length === 0) return null;

  return (
    <group>
      {chandelierPlacements.map((placement) => (
        <PlacedChandelier key={placement.id} placement={placement} />
      ))}
    </group>
  );
}
