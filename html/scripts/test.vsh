attribute vec4 rgba;

varying vec4 vrgba;

void main() {
	vrgba = rgba;
	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
}