import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI({width: 400})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// move variables out from galaxy function so they can be checked inside the galaxyfunction
let particleGeometry = null
let particleMaterial = null
let points = null

const parameters = {}
parameters.count = 100000   
parameters.size = 0.01
parameters.radius = 5
parameters.branches = 3
parameters.spinAngle = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColor = '#00ff00'
parameters.outsideColor = '#ff0000'


/**Galaxy function */
const generateGalaxy = () => {
    //check if previous galaxy exists in memory and dispose of it
    if (points !== null){
        particleGeometry.dispose()
        particleMaterial.dispose()
        scene.remove(points)
    }

    particleGeometry = new THREE.BufferGeometry()
    const positionsArray = new Float32Array(parameters.count * 3) 
    const colorsArray = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)

    console.log(colorInside)

    for (let i = 0; i < parameters.count; i++){
        const i3 = i * 3

        
        const radius = Math.random() *parameters.radius
        // this will return numbers from 0 to paramaters.branches-1
        const spinAngle = radius * parameters.spinAngle
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) 
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)

        positionsArray[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX //the x value
        positionsArray[i3+1] = 0 + randomY //the y value
        positionsArray[i3+2] = Math.sin(branchAngle + spinAngle) * radius + randomZ//the z value

        // Colors
        const colorMixed = colorInside.clone()
        colorMixed.lerp(colorOutside, radius  / parameters.radius )

        colorsArray[i3] = colorMixed.r
        colorsArray[i3 +1 ] = colorMixed.g
        colorsArray[i3 +2 ] = colorMixed.b

        // logging few values
        i < 30 ? console.log(colorMixed) : null
    }
    particleGeometry.setAttribute('position',new THREE.BufferAttribute(positionsArray, 3))
    particleGeometry.setAttribute('color',new THREE.BufferAttribute(colorsArray,3))

    //material
    particleMaterial = new THREE.PointsMaterial()
    particleMaterial.size = parameters.size
    particleMaterial.sizeAttenuation = true
    particleMaterial.depthWrite = false
    particleMaterial.blending = THREE.AdditiveBlending
    particleMaterial.vertexColors = true

    //points
    points = new THREE.Points(particleGeometry,particleMaterial)

    scene.add(points)

}

generateGalaxy()

/**Debuger */
gui.add(parameters,'count').min(100).max(100000).step(100).onFinishChange(generateGalaxy)
gui.add(parameters,'size').min(0.01).max(1).step(0.01).onFinishChange(generateGalaxy)
gui.add(parameters,'radius').min(0.1).max(10).step(0.1).onFinishChange(generateGalaxy)
gui.add(parameters,'branches').min(2).max(10).step(1).onFinishChange(generateGalaxy)
gui.add(parameters,'spinAngle').min(-5).max(5).step(0.1).onFinishChange(generateGalaxy)
gui.add(parameters,'randomness').min(0).max(1).step(0.1).onFinishChange(generateGalaxy)
gui.add(parameters,'randomnessPower').min(1).max(10).step(0.1).onFinishChange(generateGalaxy)
gui.addColor(parameters,'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters,'outsideColor').onFinishChange(generateGalaxy)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()