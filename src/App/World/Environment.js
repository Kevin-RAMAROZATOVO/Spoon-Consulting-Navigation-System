import * as THREE from "three";
import App from "../App.js";
import assetStore from "../Utils/AssetStore.js";

export default class Environment {
  constructor() {
    this.app = new App();
    this.scene = this.app.scene;
    this.physics = this.app.world.physics;
    this.pane = this.app.gui.pane;

    this.assetStore = assetStore.getState()
    this.environment = this.assetStore.loadedAssets.environment

    this.loadEnvironment();
    this.addLights();
  }


  loadEnvironment() {
    // load environment here
    const environmentScene = this.environment.scene;
    this.scene.add(environmentScene);

  environmentScene.traverse((obj) => {
    if (obj.name.includes("Checkpoint") || obj.name.includes("Path")) {
      obj.visible = false;
    }
  });

    environmentScene.position.set(-4.8, 0, -7.4)
    environmentScene.rotation.set(0, -.60, 0)
    environmentScene.scale.setScalar(1.3)


    const physicalObjects = ['Sign', 'BuildingStructure', 'Department', 'Logo', 'Floor', 'Stair', 'Checkpoint', 'Path'];

    for (const child of environmentScene.children) {
      const isPhysicalObject = physicalObjects.some((keyword) => child.name.includes(keyword))
      if (isPhysicalObject) {
        child.traverse((obj) => {
          if (obj.isMesh) {
            if (child.name.includes("Floor")){
              this.physics.add(obj, "fixed", "cuboid");
            } else {
              this.physics.add(obj, "fixed", "trimesh");
            }
            
          }
        })
      }
      
    }
  }


  addLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    this.scene.add(ambientLight);

    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    this.directionalLight.position.set(1, 1, 1);
    this.scene.add(this.directionalLight);
  }

}
