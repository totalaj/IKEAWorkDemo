import { AbstractMesh, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import { velocityPixelShader } from "@babylonjs/core/Shaders/velocity.fragment";

export class FurnitureObject {
	public meshes: AbstractMesh[];

	constructor(
		filename: string,
		scene: Scene,
		onLoaded?: (loadedObject: FurnitureObject) => void
	) {
		var self = this;
		//@todo add a callback for failing
		SceneLoader.ImportMesh(null, "./", filename, scene, function (meshes) {
			self.meshes = meshes;
			self.meshes[0].name = filename;

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
