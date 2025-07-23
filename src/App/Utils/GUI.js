import { Pane } from 'tweakpane';
import checkpointPathMap from '../checkpointPathMap.js';
import checkpointData from './checkpointLabels.json';

const checkpointNameMap = checkpointData.labels;
const checkpointGroups = checkpointData.groups;

export default class GUI {
    constructor() {
        this.pane = new Pane();
        this.checkpointNames = [];

        this.text = {
            motion: 'Spacebar to move Mouse'
        }

        this.settings = {
            location: '',
            destination: '',
            showSelectedCheckpoints: false,
            showPath: false,
        };

        const checkEnvironmentReady = () => {
            const environment = window.app?.world?.environment?.environment?.scene;
            if (environment) {
                this.setupCheckpointControls(environment);
            } else {
                requestAnimationFrame(checkEnvironmentReady);
            }
        };

        checkEnvironmentReady();
    }

    setupCheckpointControls(environment) {
        this.checkpointMeshes = [];
        this.pathMeshes = [];

        environment.traverse((child) => {
            if (child.name.startsWith("Checkpoint")) {
                this.checkpointMeshes.push(child);
                this.checkpointNames.push(child.name);
                child.visible = false;
                child.traverse?.((obj) => {
                    if (obj.isMesh) obj.visible = false;
                });
            } else if (child.name.startsWith("Path")) {
                this.pathMeshes.push(child);
                child.visible = false;
                child.traverse((obj) => {
                    if (obj.isMesh) obj.visible = false;
                });
            }
        });

        if (this.checkpointNames.length === 0) return;

        this.settings.location = this.checkpointNames[0];
        this.settings.destination = this.checkpointNames[1] || this.checkpointNames[0];

        const valueMap = {};
        checkpointGroups.forEach(group => {
            group.items.forEach(name => {
                const label = checkpointNameMap[name];
                if (label !== "<Undefined>") {
                    valueMap[`${group.label} / ${label}`] = name;
                }
            });
        });

        this.pane.addBinding(this.text, 'motion', {
            label: 'Motion Control'
        });

        this.pane.addBinding(this.settings, 'location', {
            options: valueMap,
            label: 'Location',
        }).on('change', () => {
            this.updateCheckpointVisibility();
            this.highlightSelectedPath();
        });

        this.pane.addBinding(this.settings, 'destination', {
            options: valueMap,
            label: 'Destination',
        }).on('change', () => {
            this.updateCheckpointVisibility();
            this.highlightSelectedPath();
        });

        this.pane.addBinding(this.settings, 'showSelectedCheckpoints', {
            label: 'Show Selected Checkpoints',
        }).on('change', () => {
            this.updateCheckpointVisibility();
        });

        this.pane.addBinding(this.settings, 'showPath', {
            label: 'Show Path',
        }).on('change', () => {
            this.highlightSelectedPath();
        });

        this.updateCheckpointVisibility();
        this.highlightSelectedPath();
    }

    updateCheckpointVisibility() {
        const { location, destination, showSelectedCheckpoints } = this.settings;

        this.checkpointMeshes.forEach((mesh) => {
            const isVisible = showSelectedCheckpoints && (mesh.name === location || mesh.name === destination);
            mesh.visible = isVisible;
            mesh.traverse?.((obj) => {
                if (obj.isMesh) obj.visible = isVisible;
            });
        });
    }

    highlightSelectedPath() {
        const { location, destination, showPath } = this.settings;

        this.pathMeshes.forEach((obj) => {
            obj.visible = false;
            obj.traverse((child) => {
                if (child.isMesh) child.visible = false;
            });
        });

        if (showPath && location && destination && location !== destination) {
            const key = `${location}-${destination}`;
            const pathsToShow = checkpointPathMap[key] || [];

            this.pathMeshes.forEach((obj) => {
                const match = pathsToShow.includes(obj.name);
                if (match) {
                    obj.visible = true;
                    obj.traverse((child) => {
                        if (child.isMesh) child.visible = true;
                    });
                }
            });
        }
    }
}
