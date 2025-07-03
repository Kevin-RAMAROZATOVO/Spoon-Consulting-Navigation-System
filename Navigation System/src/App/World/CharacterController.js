
import * as THREE from "three";
import App from "../App.js";
import { inputStore } from "../Utils/Store.js";

export default class CharacterController {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.physics = this.app.world.physics;
    this.character = this.app.world.character.instance;

    inputStore.subscribe((state) => {
      this.forward = state.forward;
      this.backward = state.backward;
      this.left = state.left;
      this.right = state.right;
    });

    this.instantiateController();
  }

  instantiateController() {
    this.rigidBodyType =
      this.physics.rapier.RigidBodyDesc.kinematicPositionBased();
    this.rigidBody = this.physics.world.createRigidBody(this.rigidBodyType);

    this.colliderType = this.physics.rapier.ColliderDesc.cuboid(0.3, 1, 0.3);
    this.collider = this.physics.world.createCollider(
      this.colliderType,
      this.rigidBody
    );

    const worldPosition = this.character.getWorldPosition(new THREE.Vector3());
    const worldRotation = this.character.getWorldQuaternion(new THREE.Quaternion());
    this.rigidBody.setTranslation(worldPosition);
    this.rigidBody.setRotation(worldRotation);

    this.characterController = this.physics.world.createCharacterController(0.01);
    this.characterController.setApplyImpulsesToDynamicBodies(true);
    this.characterController.enableAutostep(3, 0.1, false);
    this.characterController.enableSnapToGround(1);
  }

  loop() {
    const input = new THREE.Vector3();
    if (this.forward) input.z += 1;  // Inverted to fix forward/backward
    if (this.backward) input.z -= 1;
    if (this.left) input.x -= 1;
    if (this.right) input.x += 1;

    if (input.lengthSq() > 0) {
      input.normalize();

      const cameraQuat = this.app.camera.instance.quaternion;
      const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cameraQuat).setY(0).normalize();
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraQuat).setY(0).normalize();

      const movement = new THREE.Vector3()
        .addScaledVector(forward, input.z)
        .addScaledVector(right, input.x)
        .normalize()
        .multiplyScalar(0.5);
      movement.y = -1;

      const angle = Math.atan2(movement.x, movement.z);
      const characterRotation = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angle
      );
      this.character.quaternion.slerp(characterRotation, 0.1);

      this.characterController.computeColliderMovement(this.collider, movement);
      const newPosition = new THREE.Vector3()
        .copy(this.rigidBody.translation())
        .add(this.characterController.computedMovement());

      this.rigidBody.setNextKinematicTranslation(newPosition);
      this.character.position.lerp(this.rigidBody.translation(), 0.1);
    }
  }
}
