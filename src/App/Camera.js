
import * as THREE from 'three';
import App from './App.js';
import { sizesStore } from './Utils/Store.js';

export default class Camera {
  constructor() {
    this.app = new App();
    this.canvas = this.app.canvas;
    this.scene = this.app.scene;
    this.sizesStore = sizesStore;
    this.sizes = this.sizesStore.getState();

    this.yaw = 0;

    this.setInstance();
    this.setResizeListener();
    this.setSpacebarPointerLock();
  }

  setInstance() {
    this.instance = new THREE.PerspectiveCamera(
      75,
      this.sizes.width / this.sizes.height,
      0.1,
      1000
    );
    this.instance.position.set(98, 1.5, -89);
    this.scene.add(this.instance);
  }

  setResizeListener() {
    this.sizesStore.subscribe((sizes) => {
      this.instance.aspect = sizes.width / sizes.height;
      this.instance.updateProjectionMatrix();
    });
  }

  setSpacebarPointerLock() {
    document.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        event.preventDefault();
        if (document.pointerLockElement === this.canvas) {
          document.exitPointerLock();
        } else {
          this.canvas.requestPointerLock();
        }
      }
    });

    document.addEventListener('pointerlockchange', () => {
      if (document.pointerLockElement === this.canvas) {
        document.addEventListener('mousemove', this.handleMouseMove, false);
      } else {
        document.removeEventListener('mousemove', this.handleMouseMove, false);
      }
    });
  }

  handleMouseMove = (event) => {
    const sensitivity = 0.002;
    this.yaw -= event.movementX * sensitivity;
  };

  loop() {
    const rigidBody = this.app.world.characterController?.rigidBody;
    if (!rigidBody) return;

    const pos = rigidBody.translation();
    this.instance.position.set(pos.x, pos.y + 1.5, pos.z);

    const targetQuat = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.yaw
    );

    this.instance.quaternion.slerp(targetQuat, 0.1);
  }
}