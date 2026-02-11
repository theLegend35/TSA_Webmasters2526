import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import "./EventExperience.css";

interface ParkingLot3DProps {
  selectedSpot?: string | null;
  onSelectSpot?: (spotId: string) => void;
}

type SpotStatus = "open" | "reserved" | "premium";

interface SpotData {
  id: string;
  status: SpotStatus;
  position: [number, number, number];
}

const ParkingLot3D: React.FC<ParkingLot3DProps> = ({
  selectedSpot,
  onSelectSpot,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotMeshesRef = useRef<THREE.Mesh[]>([]);

  const spots = useMemo<SpotData[]>(() => {
    const rows = 4;
    const cols = 6;
    const data: SpotData[] = [];
    let index = 1;

    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        const status: SpotStatus =
          (r + c) % 7 === 0
            ? "premium"
            : (r + c) % 3 === 0
              ? "reserved"
              : "open";
        data.push({
          id: `P-${index}`,
          status,
          position: [c * 1.6 - 4, 0.15, r * 1.4 - 2.2],
        });
        index += 1;
      }
    }

    return data;
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101010);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(8, 6, 8);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);

    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(6, 10, 4);
    scene.add(light);

    const floorGeo = new THREE.PlaneGeometry(16, 12);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const spotGeo = new THREE.BoxGeometry(1.2, 0.2, 0.8);
    const getColor = (status: SpotStatus) => {
      if (status === "reserved") return 0xef4444;
      if (status === "premium") return 0xf59e0b;
      return 0x16a34a;
    };

    spotMeshesRef.current = spots.map((spot) => {
      const mat = new THREE.MeshStandardMaterial({
        color: getColor(spot.status),
      });
      const mesh = new THREE.Mesh(spotGeo, mat);
      mesh.position.set(...spot.position);
      mesh.userData = { id: spot.id, status: spot.status };
      scene.add(mesh);
      return mesh;
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handlePointer = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(spotMeshesRef.current);
      if (hits.length === 0) return;

      const target = hits[0].object as THREE.Mesh;
      const status = target.userData?.status as SpotStatus | undefined;
      const spotId = target.userData?.id as string | undefined;

      if (spotId && status && status !== "reserved") {
        onSelectSpot?.(spotId);
      }
    };

    container.addEventListener("pointerdown", handlePointer);

    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      render();
    };

    const render = () => {
      renderer.render(scene, camera);
    };

    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      render();
      frameId = requestAnimationFrame(animate);
    };

    let frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointerdown", handlePointer);
      spotMeshesRef.current = [];
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [onSelectSpot, spots]);

  useEffect(() => {
    spotMeshesRef.current.forEach((mesh) => {
      const isSelected = mesh.userData?.id === selectedSpot;
      mesh.scale.set(
        isSelected ? 1.12 : 1,
        isSelected ? 1.12 : 1,
        isSelected ? 1.12 : 1,
      );
      const material = mesh.material as THREE.MeshStandardMaterial;
      material.emissive.setHex(isSelected ? 0xffffff : 0x000000);
      material.emissiveIntensity = isSelected ? 0.35 : 0;
    });
  }, [selectedSpot]);

  return (
    <div ref={containerRef} className="evx-parking-stage evx-parking-canvas" />
  );
};

export default ParkingLot3D;
