import {
	AbstractMesh,
	Scene,
	SceneLoader,
	StandardMaterial,
	Texture,
	Vector3,
} from "@babylonjs/core";

// Describes features of a mesh to be loaded
export class FurnitureObjectDescriptor {
	public meshPath: string;
	public name: string;

	// Add more info about furniture object here (bounds, scale, many other things potentially)

	constructor(meshPath: string, name: string) {
		this.meshPath = meshPath;
		this.name = name;
	}
}

// Represents a loaded mesh
export class FurnitureObject {
	//#region Properties

	private _meshes: AbstractMesh[];
	public get meshes(): AbstractMesh[] {
		return this._meshes;
	}
	private set meshes(value: AbstractMesh[]) {
		this._meshes = value;
	}

	private _descriptor: FurnitureObjectDescriptor;
	public get descriptor(): FurnitureObjectDescriptor {
		return this._descriptor;
	}
	private set descriptor(value: FurnitureObjectDescriptor) {
		this._descriptor = value;
	}
	//#endregion

	constructor(
		descriptor: FurnitureObjectDescriptor,
		scene: Scene,
		onLoaded?: (loadedObject: FurnitureObject) => void
	) {
		var self = this;
		//@todo add a callback for failing
		//also use fs to check if file actually exists
		SceneLoader.ImportMesh(
			"",
			"./",
			descriptor.meshPath,
			scene,
			function (meshes) {
				self.meshes = meshes;
				self.descriptor = descriptor;

				self.setMaterial("texture/default.png", scene);

				if (onLoaded) {
					onLoaded(self);
				}
			}
		);
	}

	equals(other: FurnitureObject): boolean {
		let anyEqual = false;
		other.meshes.forEach((A) => {
			this.meshes.forEach((B) => {
				if (A.uniqueId == B.uniqueId) {
					anyEqual = true;
				}
			});
		});

		return anyEqual;
	}

	loop(dt: number) {}

	selected() {
		this.meshes.forEach((mesh) => {
			mesh.enableEdgesRendering();
		});
	}

	deselected() {
		this.meshes.forEach((mesh) => {
			mesh.disableEdgesRendering();
		});
	}

	extend() {
		//  @todo, Load meshes as updatable and modify vertex data. This isn't what we want to do, plus it causes problems with positions somehow
		this.meshes.forEach((mesh) => {
			mesh.scaling = new Vector3(2, 1, 1);
		});
	}

	setMaterial(filename: string, scene: Scene) {
		// Yeah use fs to check if file exists, or at least use some kind of error checking here
		let material = new StandardMaterial("FurnitureMaterial", scene);
		material.diffuseTexture = new Texture(filename, scene);
		material.emissiveTexture = new Texture(filename, scene);

		this.meshes.forEach((mesh) => {
			mesh.material = material;
		});
	}

	setShader() {
		// throw new NotImplementedExeption();
	}

	locallyTranslate(vector3: Vector3) {
		this.meshes.forEach((mesh) => {
			mesh.locallyTranslate(vector3);
		});
	}

	setPosition(position: Vector3) {
		this.meshes.forEach((mesh) => {
			mesh.setPositionWithLocalVector(position);
		});
	}

	getPosition(): Vector3 {
		if (this.meshes.length > 0) {
			return this.meshes[0].position;
		} else {
			return Vector3.Zero();
		}
	}

	setRotation(rotation: Vector3) {
		this.meshes.forEach((mesh) => {
			mesh.rotation = rotation;
		});
	}

	setScaling(scaling: Vector3) {
		this.meshes.forEach((mesh) => {
			mesh.scaling = scaling;
		});
	}
}
