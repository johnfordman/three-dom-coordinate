import Stats from '../libs/stats.min'

export default class App {

    constructor() {
        this.init()
    }

    init() {
        this.stats =  new Stats()
        this.stats.showPanel( 0 ) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild( this.stats.dom )

        this.container = document.querySelector( '#main' )
        document.body.appendChild( this.container )
        
        // renderer
    	this.renderer = new THREE.WebGLRenderer({ antialias: true })
    	this.renderer.setPixelRatio(window.devicePixelRatio)
    	this.renderer.setSize( window.innerWidth, window.innerHeight)
        this.container.appendChild(this.renderer.domElement)
        
        // camera
        this.camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 10000)
        const cameraZ = 20        
        this.camera.position.set(0, 0, cameraZ)
        // scene
        this.scene = new THREE.Scene()

        // ambient
        this.scene.add(new THREE.AmbientLight(0x222222))
    
        // light
        var light = new THREE.DirectionalLight(0xffffff, 1)
        light.position.set(0, 20, 0)
        this.scene.add(light)

        let screenDepth = void 0
        console.log('---: ', screenDepth = this.findScreenDepth(this.camera, this.renderer))
        document.body.style.perspective = `${screenDepth}px`

        const PlaneGeometry = new THREE.BoxBufferGeometry(600, 400, 0.0001)
	    const material =  new THREE.MeshBasicMaterial({ color: 'skyblue' })
        this.mesh = new THREE.Mesh(PlaneGeometry, material)
        this.mesh.position.set(0, 0, -screenDepth + cameraZ)
    	this.scene.add(this.mesh, this.camera)

    	window.addEventListener('resize', this.onWindowResize.bind(this), false)
        this.onWindowResize()

        this.renderer.animate( this.render.bind(this) )
    }

    render() {
        this.stats.update()
    	this.renderer.render(this.scene, this.camera)
    }

    findScreenDepth(camera, renderer) {
        let near = camera.near
        let far = camera.far
        let _renderer$getDrawingB = renderer.getDrawingBufferSize()
        let physicalViewHeight = _renderer$getDrawingB.height

        // RESOLUTION, divide by the pixel ratio so that we find the plane where
        // one unit spans one CSSpixel, which actually spans (CSSpixel * pixelRatio)
        // physical pixels. Basically, if pixel ratio is 2, then one CSS pixel
        // spans 2 physical pixels.

        let cssViewHeight = physicalViewHeight / renderer.getPixelRatio()
        
        // they should match if canvas is full widht/height of the window.
        console.log(window.innerWidth, window.innerHeight, cssViewHeight)

        var threshold = 0.00000000000001

        return _findScreenDepth(near, far)

        function _findScreenDepth(near, far) {

            let midpoint = (far - near) / 2 + near
            let midpointHeight = visibleHeightAtZDepth(-midpoint, camera)
            console.log('midpoint', midpointHeight)
            if (Math.abs(cssViewHeight / midpointHeight - 1) <= threshold) return midpoint

            if (cssViewHeight < midpointHeight) return _findScreenDepth(near, midpoint);else if (cssViewHeight > midpointHeight) return _findScreenDepth(midpoint, far);else if (midpointHeight == cssViewHeight) {
                return midpoint;
                // almost never happens  
            } 
        }
        function visibleHeightAtZDepth(depth, camera) {
            // vertical fov in radians
            var vFOV = camera.fov * Math.PI / 180
        
            // Math.abs to ensure the result is always positive
            return 2 * Math.tan(vFOV / 2) * Math.abs(depth)
        }

        function visibleWidthAtZDepth(depth, camera) {
            var height = visibleHeightAtZDepth(depth, camera)
            return height * camera.aspect
        }
    }
    onWindowResize() {
    	this.camera.updateProjectionMatrix()
    	this.renderer.setSize( window.innerWidth, window.innerHeight)
    }
}