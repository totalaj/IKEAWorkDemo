import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import {
	Engine,
	Scene,
	ArcRotateCamera,
	Vector3,
	HemisphericLight,
	Mesh,
	MeshBuilder,
	SceneLoader,
	AbstractMesh,
} from "@babylonjs/core";
import { FurnitureObject } from "./script/furnitureObject";

class App {
	private scene: Scene;
	private engine: Engine;

	private furnitureObjects: FurnitureObject[] = new Array(0);
	private meshObjectMap: Map<number, FurnitureObject> = new Map();

	private currentFurnitureObject: FurnitureObject;

	private canvas: HTMLCanvasElement;
	private header: HTMLElement;
	private inspector: HTMLDivElement;
	private extendButton: HTMLButtonElement;
	private textureSelector: HTMLSelectElement;

	constructor() {
		let self = this;

		self.initializeHTML();

		// initialize babylon scene and engine
		this.engine = new Engine(this.canvas, true);
		this.scene = new Scene(this.engine);

		var camera: ArcRotateCamera = new ArcRotateCamera(
			"Camera",
			Math.PI / 2,
			Math.PI / 2,
			2,
			Vector3.Zero(),
			this.scene
		);
		camera.attachControl(this.canvas, true);

		var light1: HemisphericLight = new HemisphericLight(
			"light1",
			new Vector3(1, 1, 0),
			this.scene
		);

		// Add testing furniture
		this.addNewFurniture("models/chair/chair.glb");
		this.addNewFurniture("models/chair/chair.glb", (loadedObject) => {
			loadedObject.setPosition(new Vector3(0, 0, 4));
		});
		this.addNewFurniture("models/shelf/shelf.glb", (loadedObject) => {
			loadedObject.setPosition(new Vector3(0, 7, -2));
		});
		this.addNewFurniture("models/shelf/shelf.glb", (loadedObject) => {
			loadedObject.setPosition(new Vector3(0, 7, 0));
		});
		this.addNewFurniture("models/shelf/shelf.glb", (loadedObject) => {
			loadedObject.setPosition(new Vector3(0, 7, 2));
		});

		this.scene.onPointerDown = function (evt, pickResult) {
			if (pickResult.hit) {
				if (self.meshObjectMap.has(pickResult.pickedMesh.uniqueId)) {
					let pickedFurnitureObject = self.meshObjectMap.get(
						pickResult.pickedMesh.uniqueId
					);

					self.selectFurniture(pickedFurnitureObject);
				}
			} else if (self.currentFurnitureObject != null) {
				self.deselectFurniture();
			}
		};

		// run the main render loop
		this.engine.runRenderLoop(() => {
			this.scene.render();

			let dt = this.scene.deltaTime / 1000;
			dt = !Number.isNaN(dt) ? dt : 0;

			this.furnitureObjects.forEach((furnitureObject) => {
				furnitureObject.loop(dt);
			});
		});
	}

	initializeHTML() {
		// create the canvas html element and attach it to the webpage
		this.canvas = document.createElement("canvas");
		this.canvas.style.width = "100%";
		this.canvas.style.height = "100%";
		this.canvas.id = "renderCanvas";
		document.body.appendChild(this.canvas);

		// Create title
		this.header = document.createElement("h1");
		this.header.innerText = "Text";
		document.body.append(this.header);

		// Initialize inspector and all controls
		this.inspector = document.createElement("div");
		document.body.append(this.inspector);

		// Extension button
		this.extendButton = document.createElement("button");
		this.extendButton.textContent = "Extend";
		this.extendButton.addEventListener("click", () => {
			this.extendCurrentFurniture();
		});

		this.inspector.append(this.extendButton);

		this.textureSelector = document.createElement("select");
		let opt = document.createElement("option");
		opt.value = "texture/default.png";
		opt.innerHTML = "Default";
		this.textureSelector.appendChild(opt);
		opt = document.createElement("option");
		opt.value = "texture/green.png";
		opt.innerHTML = "Green";
		this.textureSelector.appendChild(opt);
		opt = document.createElement("option");
		opt.value = "texture/checkers.png";
		opt.innerHTML = "Checkerboard";
		this.textureSelector.appendChild(opt);
		this.textureSelector.addEventListener("change", () => {
			console.log(this.currentFurnitureObject);
			if (this.currentFurnitureObject) {
				this.currentFurnitureObject.setMaterial(
					this.textureSelector.options[
						this.textureSelector.selectedIndex
					].value,
					this.scene
				);
			}
		});

		this.inspector.append(this.textureSelector);
	}

	addNewFurniture(
		filename: string,
		onLoaded?: (loadedObject: FurnitureObject) => void
	) {
		var newFurnitureObject: FurnitureObject = new FurnitureObject(
			filename,
			this.scene,
			(loadedFurniture) => {
				loadedFurniture.meshes.forEach((mesh) => {
					this.meshObjectMap.set(mesh.uniqueId, loadedFurniture);
				});

				if (onLoaded) {
					onLoaded(loadedFurniture);
				}
				this.furnitureObjects.push(newFurnitureObject);
			}
		);
	}

	selectFurniture(furnitureObject: FurnitureObject) {
		if (furnitureObject) {
			if (this.currentFurnitureObject) {
				if (!this.currentFurnitureObject.equals(furnitureObject)) {
					this.currentFurnitureObject.deselected();
				} else {
					return;
				}
			}

			this.currentFurnitureObject = furnitureObject;
			this.currentFurnitureObject.selected();

			this.header.innerText = this.currentFurnitureObject.name;
		}
	}

	deselectFurniture() {
		if (this.currentFurnitureObject != null) {
			this.currentFurnitureObject.deselected();
			this.currentFurnitureObject = null;
			this.header.innerText = "";
		}
	}

	extendCurrentFurniture() {
		if (this.currentFurnitureObject) {
			this.currentFurnitureObject.extend();
			console.log("Extend", this.currentFurnitureObject.name);
		}
	}
}

new App();
