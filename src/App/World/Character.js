import * as THREE from "three";
import assetStore from "../Utils/AssetStore.js";

import App from "../App.js";
export default class Character {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.assetStore = assetStore.getState()
    this.avatar = this.assetStore.loadedAssets.avatar
    // console.log(this.avatar)

    this.instantiateCharacter();
  }

  instantiateCharacter() {
    // create character and add to scene
    const geometry = new THREE.BoxGeometry(.6, 2, .6);
    const material = new THREE.MeshStandardMaterial({
      color: 0x00ff00,
      wireframe: true,
      visible: false,
    });
    this.instance = new THREE.Mesh(geometry, material);
    this.app.world.environment.environment.scene.add(this.instance);
    this.instance.position.set(70,0.05,-89);//(98,0.05,-89)
    this.instance.rotation.y = Math.PI / 2;

    // add avatar to character
    const avatar = this.avatar.scene
    avatar.rotation.y = -Math.PI / 2
    avatar.position.y = -1
    avatar.scale.setScalar(3)
    avatar.visible = false;
    this.instance.add(avatar)
  }
}

