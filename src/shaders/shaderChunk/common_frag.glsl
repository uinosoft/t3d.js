uniform mat4 u_View;

uniform float u_Opacity;
uniform vec3 u_Color;

uniform vec3 u_CameraPosition;

bool isPerspectiveMatrix( mat4 m ) {

	return m[ 2 ][ 3 ] == - 1.0;

}

struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};