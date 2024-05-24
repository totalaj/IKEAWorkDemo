import { AbstractMesh, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
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
		SceneLoader.ImportMesh(null, "./", filename, scene, function (meshes) {
			self.meshes = meshes;
			self.name = filename;
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
		console.log("Selected", this.meshes[0].name);
		this.meshes.forEach((mesh) => {
			mesh.locallyTranslate(new Vector3(0, 0.3, 0));
		});
	}

	deselected() {
		console.log("Deselected", this.meshes[0].name);
		this.meshes.forEach((mesh) => {
			mesh.locallyTranslate(new Vector3(0, -0.3, 0));
		});
	}

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
