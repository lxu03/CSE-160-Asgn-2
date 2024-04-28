class TriangularPrism{
    constructor(color){
      this.type = "triangularprism";
      this.color = color;
      this.matrix = new Matrix4();
    }

    render(pecFinCtrl) {
      var rgba = this.color;
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      //top/front
      drawTriangle3D([0,0,0,1,1,1,1,0,0])
      drawTriangle3D([0,0,0,1,1,1,0,1,1])
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3])
      //sides
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, 1)
      if (pecFinCtrl == "left") {
      drawTriangle3D([1,0,0,1,1,1,1,0,1])
      gl.uniform4f(u_FragColor, 0.85, 0.85, 0.85, rgba[3])
      drawTriangle3D([0,0,0,0,1,1,0,0,1])
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3])
      }
      else if (pecFinCtrl == "right") {
      drawTriangle3D([0,0,0,0,1,1,0,0,1])
      gl.uniform4f(u_FragColor, 0.85, 0.85, 0.85, rgba[3])
      drawTriangle3D([1,0,0,1,1,1,1,0,1])
      gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3])
      }
      else {
        drawTriangle3D([1,0,0,1,1,1,1,0,1])
        drawTriangle3D([0,0,0,0,1,1,0,0,1])
      }
      //bottom
      drawTriangle3D([0,0,0,1,0,1,0,0,1])
      drawTriangle3D([0,0,0,1,0,1,1,0,0])
      //back
      drawTriangle3D([0,0,1,1,1,1,1,0,1])
      drawTriangle3D([0,0,1,1,1,1,0,1,1])
    }
}
