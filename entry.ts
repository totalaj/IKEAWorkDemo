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
	PointLight,
	Color3,
} from "@babylonjs/core";
import {
	FurnitureObject,
	FurnitureObjectDescriptor,
} from "./script/furnitureObject";

class App {
	//#region Variables
	private scene: Scene;
	private engine: Engine;

	private furnitureObjects: FurnitureObject[] = new Array(0);
	private meshObjectMap: Map<number, FurnitureObject> = new Map();

	private currentFurnitureObject: FurnitureObject;

	// Html elements
	private canvas: HTMLCanvasElement;
	private header: HTMLElement;
	private inspector: HTMLDivElement;
	private extendButton: HTMLButtonElement;
	private textureSelector: HTMLSelectElement;
	private xInput: HTMLInputElement;
	private yInput: HTMLInputElement;
	private zInput: HTMLInputElement;

	// I wanted to load these from files, but I had some difficulties. Just pretend these were loaded from files
	private chairDescriptor: FurnitureObjectDescriptor =
		new FurnitureObjectDescriptor("models/chair/chair.glb", "Chair");
	private shelfDescriptor: FurnitureObjectDescriptor =
		new FurnitureObjectDescriptor("models/shelf/shelf.glb", "Shelf");

	//#endregion

	constructor() {
		let self = this; // Not sure if self is needed, should look more into the this-pointer in callbacks

		this.initializeHTML();

		// Initialize babylon scene and engine
		this.engine = new Engine(this.canvas, true);
		this.scene = new Scene(this.engine);

		var camera: ArcRotateCamera = new ArcRotateCamera(
			"Camera",
			Math.PI,
			Math.PI / 2,
			10,
			Vector3.Zero(),
			this.scene
		);
		// Make camera recieve input from the render canvas
		camera.attachControl(this.canvas, true);

		var light1: HemisphericLight = new HemisphericLight(
			"light1",
			new Vector3(1, 1, 0),
			this.scene
		);

		light1.groundColor = new Color3(1, 0.8, 0.8);

		var light2: PointLight = new PointLight(
			"light2",
			new Vector3(10, 0, 0),
			this.scene
		);

		MeshBuilder.CreateGround("ground", {
			width: 30,
			height: 30,
		}).setAbsolutePosition(new Vector3(0, -1, 0));

		// Add testing furniture
		// This is ideally done by user, when such controls are implemented
		this.addNewFurniture(this.chairDescriptor, (loadedObject) => {
			loadedObject.setPosition(new Vector3(0, 0, 0));
		});
		this.addNewFurniture(this.chairDescriptor, (loadedObject) => {
			loadedObject.setPosition(new Vector3(0, 0, 4));
		});
		this.addNewFurniture(this.shelfDescriptor, (loadedObject) => {
			loadedObject.setPosition(new Vector3(0, 4, -1));
		});
		this.addNewFurniture(this.shelfDescriptor, (loadedObject) => {
			loadedObject.setPosition(new Vector3(0, 4, 0));
		});
		this.addNewFurniture(this.shelfDescriptor, (loadedObject) => {
			loadedObject.setPosition(new Vector3(0, 4, 1));
		});

		// Bind pick function
		this.scene.onPointerDown = function (evt, pickResult) {
			self.processPickResult(pickResult);
		};

		// Render loop
		this.engine.runRenderLoop(() => {
			this.scene.render();

			// calculate delta-time in seconds and tick all furniture objects
			let dt = this.scene.deltaTime / 1000;
			dt = !Number.isNaN(dt) ? dt : 0;

			this.furnitureObjects.forEach((furnitureObject) => {
				furnitureObject.loop(dt);
			});
		});
	}

	private processPickResult(pickResult) {
		if (pickResult.hit) {
			// If hit something, and that object exists in our map, select it
			if (this.meshObjectMap.has(pickResult.pickedMesh.uniqueId)) {
				let pickedFurnitureObject = this.meshObjectMap.get(
					pickResult.pickedMesh.uniqueId
				);

				this.selectNewFurniture(pickedFurnitureObject);
				return; // Early return ensures deselect unless new selection happens
			}
		}

		if (this.currentFurnitureObject != null) {
			this.deselectCurrentFurniture();
		}
	}

	initializeHTML() {
		let self = this;
		// This should all be able to be defined in HTML

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
		this.inspector.hidden = true;
		document.body.append(this.inspector);

		// Extension button
		this.extendButton = document.createElement("button");
		this.extendButton.textContent = "Extend";
		this.extendButton.addEventListener("click", () => {
			this.extendCurrentFurniture();
		});

		this.inspector.append(this.extendButton);

		this.inspector.append(document.createElement("br"));

		let colorLabel = document.createElement("label");
		colorLabel.innerText = "Color:";
		this.inspector.appendChild(colorLabel);

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

		// When new option is selected, set the material in the current furniture object from the value as defined above
		this.textureSelector.addEventListener("change", () => {
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
		this.inspector.append(document.createElement("br"));

		let xText = document.createElement("label");
		xText.innerText = "X:";
		let yText = document.createElement("label");
		yText.innerText = "Y:";
		let zText = document.createElement("label");
		zText.innerText = "Z:";

		let onPositionInput = function () {
			self.updatePositionFromInput();
		};

		this.xInput = document.createElement("input");
		this.xInput.type = "number";
		this.xInput.oninput = onPositionInput;

		this.yInput = document.createElement("input");
		this.yInput.type = "number";
		this.yInput.oninput = onPositionInput;

		this.zInput = document.createElement("input");
		this.zInput.type = "number";
		this.zInput.oninput = onPositionInput;

		this.inspector.append(xText);
		this.inspector.append(this.xInput);
		this.inspector.append(yText);
		this.inspector.append(this.yInput);
		this.inspector.append(zText);
		this.inspector.append(this.zInput);
	}

	// New furniture is created and registered in a unique-id to FurnitureObject map for fetching from a mesh
	addNewFurniture(
		descriptor: FurnitureObjectDescriptor,
		onLoaded?: (loadedObject: FurnitureObject) => void
	) {
		var newFurnitureObject: FurnitureObject = new FurnitureObject(
			descriptor,
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

	selectNewFurniture(furnitureObject: FurnitureObject) {
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

			this.header.innerText = this.currentFurnitureObject.descriptor.name;
			this.inspector.hidden = false;
			this.xInput.valueAsNumber =
				this.currentFurnitureObject.getPosition().x;
			this.yInput.valueAsNumber =
				this.currentFurnitureObject.getPosition().y;
			this.zInput.valueAsNumber =
				this.currentFurnitureObject.getPosition().z;
		}
	}

	deselectCurrentFurniture() {
		if (this.currentFurnitureObject != null) {
			this.currentFurnitureObject.deselected();
			this.currentFurnitureObject = null;
			this.header.innerText = "";
			this.inspector.hidden = true;
		}
	}

	extendCurrentFurniture() {
		this.currentFurnitureObject?.extend();
	}

	updatePositionFromInput() {
		if (this.currentFurnitureObject) {
			this.currentFurnitureObject.setPosition(
				new Vector3(
					this.xInput.valueAsNumber ?? 0,
					this.yInput.valueAsNumber ?? 0,
					this.zInput.valueAsNumber ?? 0
				)
			);
		}
	}
}

new App();
