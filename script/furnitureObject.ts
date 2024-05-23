import { AbstractMesh, Scene, SceneLoader, Vector3 } from "@babylonjs/core";

export class FurnitureObject
{
    private mesh : AbstractMesh;

    constructor(filename: string, scene: Scene)
    {
        var self = this;
        SceneLoader.ImportMesh(null, "./", filename, scene, function (meshes, particleSystems, skeletons) {
            self.mesh = meshes.at(0); // Should certainly be checked
          });
    }

    loop(dt : number)
    {
        if (this.mesh != null){
            this.mesh.locallyTranslate(new Vector3(0,dt,0));
        }
    }
}