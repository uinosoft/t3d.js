vec4 worldPosition = u_Model * vec4(transformed, 1.0);
gl_Position = u_ProjectionView * worldPosition;