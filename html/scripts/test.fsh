#ifdef GL_ES
precision highp float;
#endif

varying vec4 vrgba;

void main(void) {
	gl_FragColor = vrgba;
}