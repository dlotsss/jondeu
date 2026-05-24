import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import Room from './Room';
import ChandelierLoader from './ChandelierLoader';
import { usePlannerStore } from '@/store/usePlannerStore';

export default function CanvasContainer() {
  const { isMobile, isEveningMode, chandelierPlacements } = usePlannerStore();

  return (
    <div className="w-full h-full relative">
      <Canvas
        className="h-full w-full"
        style={{ width: '100%', height: '100%' }}
        shadows
        dpr={isMobile ? 1.0 : 1.5}
        camera={{ position: [0, 1.8, 4.5], fov: 60 }}
        gl={{ powerPreference: "high-performance", antialias: true }} 
      >
        <Suspense fallback={null}>
          {/* Мягкий рассеянный свет (меняется в зависимости от времени суток) */}
          <ambientLight intensity={isEveningMode ? 0.08 : 0.4} />
          
          {/* Направленный солнечный свет днем */}
          <directionalLight 
            position={[5, 8, 3]} 
            intensity={isEveningMode ? 0.02 : 0.8} 
            castShadow={!isEveningMode}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />

          {/* Вспомогательный источник света, если наступил вечер, но люстр нет */}
          {isEveningMode && chandelierPlacements.length === 0 && (
            <pointLight
              position={[0, 2.6, 0]}
              intensity={1.0}
              distance={6}
              color="#ffffff"
              castShadow
            />
          )}
          
          {/* HDR-карта для создания физически точных отражений в металле и хрустале */}
          <Environment preset={isEveningMode ? "night" : "city"} /> 

          <Room />
          <ChandelierLoader />

          {/* Реалистичные мягкие тени под люстрой и на стыках стен */}
          <ContactShadows position={[0, 0.01, 0]} opacity={isEveningMode ? 0.6 : 0.4} scale={10} blur={2.5} />

          {/* Управление камерой — разрешаем смотреть вверх на потолок */}
          <OrbitControls 
            enableDamping 
            dampingFactor={0.08}
            maxPolarAngle={Math.PI * 0.85}
            minPolarAngle={0.1}
            minDistance={1.2}
            maxDistance={8}
            target={[0, 1.0, 0]}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
