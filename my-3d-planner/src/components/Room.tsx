import * as THREE from 'three';
import {usePlannerStore} from '@/store/usePlannerStore';
import {useEffect, useState} from 'react';

type TextureProps = Partial<Record<'map' | 'normalMap' | 'roughnessMap' | 'aoMap' | 'displacementMap', THREE.Texture>>;

function getFloorTextureRepeat(width: number, length: number, visualTileArea = 1.5) {
    const tileSide = Math.sqrt(visualTileArea);

    return {
        x: Math.max(1, width / tileSide),
        z: Math.max(1, length/tileSide),
    };
}

export default function Room() {
    const {currentFloor, roomWidth, roomLength, roomTemplateId, floorPattern, wallColor, showGrid } = usePlannerStore();
    const [TextureProps, setTextureProps] = useState<TextureProps | null>(null);

    useEffect(() => {
        if (currentFloor && currentFloor.maps && currentFloor.maps.map) {
            const loader = new THREE.TextureLoader();
            const mapsToLoad = [
                currentFloor.maps.map,
                currentFloor.maps.normalMap,
                currentFloor.maps.roughnessMap,
                currentFloor.maps.aoMap,
                currentFloor.maps.displacementMap
            ].filter(Boolean) as string[];

            Promise.all(mapsToLoad.map(url => loader.loadAsync(url)))
              .then(loadedMaps => {
                const loadedProps: TextureProps = {};
                if (currentFloor.maps?.map) loadedProps.map = loadedMaps[mapsToLoad.indexOf(currentFloor.maps.map)];
                if (currentFloor.maps?.normalMap) loadedProps.normalMap = loadedMaps[mapsToLoad.indexOf(currentFloor.maps.normalMap)];
                if (currentFloor.maps?.roughnessMap) loadedProps.roughnessMap = loadedMaps[mapsToLoad.indexOf(currentFloor.maps.roughnessMap)];
                if (currentFloor.maps?.aoMap) loadedProps.aoMap = loadedMaps[mapsToLoad.indexOf(currentFloor.maps.aoMap)];
                if (currentFloor.maps?.displacementMap) loadedProps.displacementMap = loadedMaps[mapsToLoad.indexOf(currentFloor.maps.displacementMap)];

                if (loadedProps.map) {
                    loadedProps.map.colorSpace = THREE.SRGBColorSpace;
                }

                const baseRepeat = getFloorTextureRepeat(roomWidth, roomLength, currentFloor.visualTileArea);
                Object.values(loadedProps).forEach((texture) => {
                    if (!texture) return;
                    texture.wrapS = THREE.RepeatWrapping;
                    texture.wrapT = THREE.RepeatWrapping;
                    texture.anisotropy = 8;

                    if (floorPattern == 'diagonal') {
                        texture.center.set(0.5, 0.5);
                        texture.rotation = Math.PI / 4; 
                        texture.repeat.set(baseRepeat.x * 1.15, baseRepeat.z * 1.15);
                    } else  if (floorPattern == "herringbone") {
                        texture.center.set(0.5, 0.5);
                        texture.rotation = Math.PI / 4;
                        texture.repeat.set(baseRepeat.x *1.8, baseRepeat.z * 1.8);
                    } else {
                        texture.center.set(0.5, 0.5);
                        texture.rotation = 0;
                        texture.repeat.set(baseRepeat.x, baseRepeat.z);
                    }
                    texture.needsUpdate = true;
                });
                setTextureProps(loadedProps);
            })
            .catch(e => console.error("Error loading textures", e));
        } else {
            void Promise.resolve().then(() => setTextureProps(null));
        }
    }, [currentFloor, roomWidth, roomLength, floorPattern]);

    return(
      <group>
        <mesh rotation = {[-Math.PI/2, 0, 0]} position={[0, 0, 0]} receiveShadow> 
          <planeGeometry args={[roomWidth, roomLength, 128, 128]} />
          {textureProps && textureProps.map ? (
            <meshStandardMaterial 
            {...textureProps}
            color = "#ffffff"
            roughness = {textureProps.roughnessMap ? underfined : 1.0}
            displacementScale = {0.006}
            metalness = {0}
            />
          ) : (
            <meshStandardMaterial color="#8b4513" roughness = {1.0} />
          )}
        </mesh>

        <mesh position = {[0, 1.35, -roomLength / 2]} receiveShadow castShadow>
          <boxGeometry args={[roomLength, 2.7, 0.1]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>

        <mesh position = {[-roomWidth / 2, 1.35, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow castShadow>
          <boxGeometry args={[roomLength, 2.7, 0.1]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>

        <mesh position = {[roomWidth / 2, 1.35, 0]} rotation={[0, Math.PI/2, 0]} receiveShadow castShadow>
          <boxGeometry args={[roomLength, 2.7, 0.1]} />
          <meshStandardMaterial color={wallColor} roughness={0.8} />
        </mesh>

        <mesh position = {[0, 0.05, -roomLength/2 +0.05]} receiveShadow castShadow>
          <boxGeometry args={[roomWidth - 0.1, 0.1, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        <mesh position = {[-roomWidth/2 +0.05, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[roomLength - 0.1, 0.1, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        <mesh position = {[roomWidth/2 -0.05, 0.05, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[roomLength - 0.1, 0.1, 0.02]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 2.7, 0]} receiveShadow>
          <planeGeometry args={[roomWidth, roomLength]} />
          <meshStandardMaterial 
            color="#fafafa"
            roughness={0.9}
            side={THREE.BackSide}
            />
        </mesh>

        <group>
            <mesh position={[Math.min(roomWidth*0.18, 1.1), 1.55, -roomLength/2 + 0.055]} receiveShadow>
                <boxGeometry args={[Math.min(roomWidth * 0.38, 1.75), 1.05, 0.025]} />
                <meshStandardMaterial color = "#dbeafe" roughness={0.2} metalness={0.05} />
            </mesh>

            <mesh position={[Math.min(roomWidth * 0.18, 1.1), 1.55, -roomLength/2 + 0.07]} >
                <boxGeometry args={[Math.min(roomWidth * 0.42, 1.9), 0.055, 0.03]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.35} />
            </mesh>

            <mesh position={[Math.min(roomWidth * 0.18, 1.1), 1.55, -roomLength/2 + 0.075]} rotation={[0, 0, Math.PI / 2]}>
                <boxGeometry args={[1.1, 0.045, 0.03]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.35} />
            </mesh>

            <mesh position = {[-roomWidth / 2 + 0.06, 0.95, roomLength/2 - 0.75]} rotation={[0, Math.PI/2, 0]} receiveShadow>
                <boxGeometry args={[0.82, 1.9, 0.035]}/>
                <meshStandardMaterial color="#e7c9a9" roughness={0.65} />
            </mesh>

            <mesh position={[-roomWidth/2 + 0.085, 1.02, roomLength/2 - 0.48]} rotation={[0, Math.PI/2, 0]}>
                <sphereGeometry args={[0.035, 16, 16]} />
                <meshStandardMaterial color="#c084fc" metalness={0.5} roughness={0.25} />
            </mesh>
        </group>
        
        {roomTemplateId === 'studio' && (
            <group>
            <mesh position={[0, 0.012, -roomLength*0.12]} rotation={[-Math.PI / 2, 0, 0]} >
                <planeGeometry args={[roomWidth*0.86, 0.02]} />
                <meshStandardMaterial color="#3b82f6" roughness={0.5} />
            </mesh>
            <mesh position={[roomWidth * 0.22, 0.03, -roomLength * 0.3]} >
                <ringGeometry args={[0.32, 0.34, 48]} />
                <meshStandardMaterial color="#111827" roughness={0.45} />
            </mesh>
        </group>
        )}

        {roomTemplateId === 'bedroom' && (
            <mesh position={[0, 0.015, roomLength * 0.18]} rotation={[-Math.PI / 2, 0, 0]} >
                <planeGeometry args={[Math.min(roomWidth * 0.7, 2.4), 1.35]} />
                <meshStandardMaterial color="#c7d2fe" roughness={0.8} />
            </mesh>
        )}

        {roomTemplateId === 'kitchen' && (
            <mesh position = {[roomWidth/2 - 0.08, 0.48, -0.35]} rotation = {[0, Math.PI/2, 0]} castShadow receiveShadow>
                <boxGeometry args={[roomLength * 0.55, 0.9, 0.12]} />
                <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>
        )}

      </group>
    )
}