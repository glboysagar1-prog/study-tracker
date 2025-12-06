import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const FloatingShape = ({ position, color, speed, rotationSpeed }) => {
    const mesh = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        mesh.current.rotation.x = Math.cos(t * rotationSpeed) * 0.2;
        mesh.current.rotation.y = Math.sin(t * rotationSpeed) * 0.2;
        mesh.current.position.y = position[1] + Math.sin(t * speed) * 0.5;
    });

    return (
        <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={mesh} position={position}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.4}
                    roughness={0.1}
                    metalness={0.1}
                />
            </mesh>
        </Float>
    );
};

const Background3D = () => {
    const shapes = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            position: [
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10 - 5,
            ],
            color: new THREE.Color().setHSL(Math.random(), 0.7, 0.7),
            speed: Math.random() * 0.5 + 0.2,
            rotationSpeed: Math.random() * 0.5 + 0.2,
        }));
    }, []);

    return (
        <div className="absolute inset-0 -z-10 overflow-hidden bg-gradient-to-br from-gray-900 to-blue-900">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                {shapes.map((shape, i) => (
                    <FloatingShape key={i} {...shape} />
                ))}
            </Canvas>
        </div>
    );
};

export default Background3D;
