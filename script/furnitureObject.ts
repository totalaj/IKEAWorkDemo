import {
	AbstractMesh,
	Scene,
	SceneLoader,
	StandardMaterial,
	Texture,
	Vector3,
	VertexBuffer,
	VertexData,
} from "@babylonjs/core";
import { velocityPixelShader } from "@babylonjs/core/Shaders/velocity.fragment";

export class FurnitureObject {
	private _meshes: AbstractMesh[];
	public get meshes(): AbstractMesh[] {
		return this._meshes;
	}
	private set meshes(value: AbstractMesh[]) {
		this._meshes = value;
	}

	public name: string;

	constructor(
		filename: string,
		scene: Scene,
		onLoaded?: (loadedObject: FurnitureObject) => void
	) {
		var self = this;
		//@todo add a callback for failing
		SceneLoader.ImportMesh("", "./", filename, scene, function (meshes) {
			self.meshes = meshes;
			self.name = filename;

			self.setMaterial("texture/default.png", scene);

			if (onLoaded) {
				onLoaded(self);
			}
		});
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
		console.log("Selected", this.name);
		this.meshes.forEach((mesh) => {
			mesh.enableEdgesRendering();
		});
	}

	deselected() {
		console.log("Deselected", this.name);
		this.meshes.forEach((mesh) => {
			mesh.disableEdgesRendering();
		});
	}

	extend() {
		this.meshes.forEach((mesh) => {
			mesh.scaling = new Vector3(2, 1, 1);
		});
	}

	setMaterial(filename: string, scene: Scene) {
		let material = new StandardMaterial("FurnitureMaterial", scene);
		material.diffuseTexture = new Texture(filename, scene);
		material.emissiveTexture = new Texture(filename, scene);

		this.meshes.forEach((mesh) => {
			mesh.material = material;
		});
	}

	setShader() {}

	locallyTranslate(vector3: Vector3) {
		this.meshes.forEach((mesh) => {
			mesh.locallyTranslate(vector3);
		});
	}

	setPosition(position: Vector3) {
		this.meshes.forEach((mesh) => {
			mesh.position = position;
		});
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
