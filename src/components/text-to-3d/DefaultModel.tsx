import React from 'react';

export function DefaultModel() {
  return (
    <mesh>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color="#2a2a2f" />
    </mesh>
  );
}