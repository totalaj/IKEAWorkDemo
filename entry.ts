import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, Mesh, MeshBuilder, SceneLoader } from "@babylonjs/core";
import { FurnitureObject } from "./script/furnitureObject"


class App {
    
    private scene : Scene;
    private engine : Engine;
    

    constructor() {
        // create the canvas html element and attach it to the webpage
        var canvas = document.createElement("canvas");
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        canvas.id = "renderCanvas";
        document.body.appendChild(canvas);

        // initialize babylon scene and engine
        this.engine = new Engine(canvas, true);
        this.scene = new Scene(this.engine);

        var camera: ArcRotateCamera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, Vector3.Zero(), this.scene);
        camera.attachControl(canvas, true);

        var light1: HemisphericLight = new HemisphericLight("light1", new Vector3(1, 1, 0), this.scene);

        var chair : FurnitureObject = new FurnitureObject("models/chair/chair.glb", this.scene);

        // run the main render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
            
            let dt = this.scene.deltaTime / 1000;
            dt = !Number.isNaN(dt) ? dt : 0;

            chair.loop(dt);
        });
    }
}
new App();