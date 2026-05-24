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
                    }
                })

            })
        }
    })
}