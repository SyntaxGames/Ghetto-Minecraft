//Controls:
//SPACE to jump, WASD or Arrow Keys to move horizontally
//My rotating the cube based on the camera's position still is not working. 

smooth();

var speed = 0.5;
var jumpSpeed = 0.7;

var maxWorldSize = 5;
var numChunks = 2; //due to area form. actual value is numChunks squared, keep in mind
var chunkSize = 6;
var chunkHeight = 30;
var blockSize = 3;

var treeChance = 2;

var renderDistance = 1;

var canJump = false;
var yVel = 0;
var gravity = 0.05;

var fov = 120;
var fps = max;

frameRate(fps);
noStroke();

var chunks = new Array(numChunks);
for(var i = 0; i < numChunks; i++) {
    chunks[i] = new Array(numChunks);    
}

var camera3D = {
    x: 3, 
    y: -5,
    z: 3,
};  
var camDims = {
    w: 3,
    h: blockSize,
    d: 3
};

// Delag from Element118
var delag = function(f) {
    var str = f.toString();
    str = str.replace(/__env__\.KAInfiniteLoopCount\+\+;/g, '');
    str = str.replace(/if \(__env__\.KAInfiniteLoopCount > 1000\) {[\s]+__env__\.KAInfiniteLoopProtect\(\'[^']*'\);[^}]+}/g, '');
    str = str.replace(/__env__\.PJSOutput\.applyInstance\((__env__\.\S+), '\S+'\)/g, 'new $1');
    return Object.constructor('return (function(__env__) {return ' + str + ';});')()(this);
};

var setVectorValues = function(v, x, y, z, w) {
    v.x = x || 0;
    v.y = y || 0;
    v.z = z || 0;
    v.w = w || 1;
    return v;
};
var addVectors = function(v1, v2) {
    return {
        x: v1.x + v2.x, 
        y: v1.y + v2.y,
        z: v1.z + v2.z,
        w: 1,
    };    
};
var subtractVectors = function(v1, v2) {
    return {
        x: v1.x - v2.x, 
        y: v1.y - v2.y,
        z: v1.z - v2.z,
        w: 1,
    };     
};
var multiplyVector = function(vector, factor) {
    return {
        x: vector.x * factor, 
        y: vector.y * factor,
        z: vector.z * factor,
        w: 1,
    };       
};
var divideVector = function(vector, divisor) {
    return {
        x: vector.x / divisor, 
        y: vector.y / divisor,
        z: vector.z / divisor,
        w: 1,
    };  
};
var dotProduct = function(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};
var lengthOfVector = function(vector) {
    return sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
};
var triNormaliseVector = function(vector) {
    var vectorLength = lengthOfVector(vector);
    
    return {
        x: vector.x / vectorLength, 
        y: vector.y / vectorLength,
        z: vector.z / vectorLength,
        w: 1,
    };  
};
var crossProduct = function(v1, v2) {
    var vector = {
        x: 0, 
        y: 0,
        z: 0,
        w: 1,
    };  
    
    vector.x = v1.y * v2.z - v1.z * v2.y;
    vector.y = v1.z * v2.x - v1.x * v2.z;
    vector.z = v1.x * v2.y - v1.y * v2.x;
    return vector;
};
var matrixMultiplyVector = function(m, i) {
    var vector = {
        x: 0, 
        y: 0,
        z: 0,
        w: 0,
    };  
    
    vector.x = i.x * m.matrix[0][0] + i.y * m.matrix[1][0] + i.z * m.matrix[2][0] + m.matrix[3][0];
    vector.y = i.x * m.matrix[0][1] + i.y * m.matrix[1][1] + i.z * m.matrix[2][1] + m.matrix[3][1];
    vector.z = i.x * m.matrix[0][2] + i.y * m.matrix[1][2] + i.z * m.matrix[2][2] + m.matrix[3][2];
    vector.w = i.x * m.matrix[0][3] + i.y * m.matrix[1][3] + i.z * m.matrix[2][3] + m.matrix[3][3];
    return vector;
};
var makeProjectionMatrix = function(fov, near, far) {
    var aspectRatio = height / width;
    var fovRadian = 1 / tan(fov * 0.5 / 180 * 3.14159);
    var matrix = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};
    matrix.matrix[0][0] = aspectRatio * fovRadian;
    matrix.matrix[1][1] = fovRadian;
    matrix.matrix[2][2] = far / (far - near);
    matrix.matrix[3][2] = (-far * near) / (far - near);
    matrix.matrix[2][3] = 1;
    matrix.matrix[3][3] = 0;
    return matrix;
};
var matrixRotateX = function(angle) {
    var matrix = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};
    matrix.matrix[0][0] = 1;
    matrix.matrix[1][1] = cos(angle);
    matrix.matrix[1][2] = sin(angle);
    matrix.matrix[2][1] = -sin(angle);
    matrix.matrix[2][2] = cos(angle);
    matrix.matrix[3][3] = 1;
    return matrix;
};
var matrixRotateY = function(angle) {
    var matrix = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};
    matrix.matrix[0][0] = cos(angle);
    matrix.matrix[0][2] = sin(angle);
    matrix.matrix[2][0] = -sin(angle);
    matrix.matrix[1][1] = 1;
    matrix.matrix[2][2] = cos(angle);
    matrix.matrix[3][3] = 1;
    return matrix;
};
var matrixRotateZ = function(angle) {
    var matrix = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};
    matrix.matrix[0][0] = cos(angle);
    matrix.matrix[0][1] = sin(angle);
    matrix.matrix[1][0] = -sin(angle);
    matrix.matrix[1][1] = cos(angle);
    matrix.matrix[2][2] = 1;
    matrix.matrix[3][3] = 1;
    return matrix;
};
var translateMatrix = function(x, y, z) {
    var matrix = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};
    matrix.matrix[0][0] = 1;
    matrix.matrix[1][1] = 1;
    matrix.matrix[2][2] = 1;
    matrix.matrix[3][3] = 1;
    matrix.matrix[3][0] = x;
    matrix.matrix[3][1] = y;
    matrix.matrix[3][2] = z;
    return matrix;
};
var makeIdentity = function() {
    var matrix = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};
    matrix.matrix[0][0] = 1;
    matrix.matrix[1][1] = 1;
    matrix.matrix[2][2] = 1;
    matrix.matrix[3][3] = 1;
    return matrix;
};
var matrixMultiplyMatrix = function(m1, m2) {
	var matrix = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};
	for (var i = 0; i < 4; i++) {
		for (var j = 0; j < 4; j++) {
			matrix.matrix[j][i] = m1.matrix[j][0] * m2.matrix[0][i] + m1.matrix[j][1] * m2.matrix[1][i] + m1.matrix[j][2] * m2.matrix[2][i] + m1.matrix[j][3] * m2.matrix[3][i];
		}
	}
	return matrix;
};
var matrixPointAt = function(pos, target, up) {
		var newForward = subtractVectors(target, pos);
		newForward = triNormaliseVector(newForward);

		// Calculate new Up direction
		var a = multiplyVector(newForward, dotProduct(up, newForward));
		var newUp = subtractVectors(up, a);
		newUp = triNormaliseVector(newUp);

		// New Right direction is easy, its just cross product
		var newRight = crossProduct(newUp, newForward);

		// Construct Dimensioning and Translation Matrix	
		var matrix = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};
		matrix.matrix[0][0] = newRight.x;	
		matrix.matrix[0][1] = newRight.y;	
		matrix.matrix[0][2] = newRight.z;
		matrix.matrix[0][3] = 0;
		matrix.matrix[1][0] = newUp.x;	
		matrix.matrix[1][1] = newUp.y;		
		matrix.matrix[1][2] = newUp.z;		
		matrix.matrix[1][3] = 0;
		matrix.matrix[2][0] = newForward.x;	
		matrix.matrix[2][1] = newForward.y;	
		matrix.matrix[2][2] = newForward.z;	
		matrix.matrix[2][3] = 0;
		matrix.matrix[3][0] = pos.x;			
		matrix.matrix[3][1] = pos.y;			
		matrix.matrix[3][2] = pos.z;			
		matrix.matrix[3][3] = 1;
		return matrix;
};
var quickInverseMatrix = function(m) {
		var matrix = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};
		matrix.matrix[0][0] = m.matrix[0][0]; 
		matrix.matrix[0][1] = m.matrix[1][0]; 
		matrix.matrix[0][2] = m.matrix[2][0]; 
		matrix.matrix[0][3] = 0;
		matrix.matrix[1][0] = m.matrix[0][1]; 
		matrix.matrix[1][1] = m.matrix[1][1]; 
		matrix.matrix[1][2] = m.matrix[2][1]; 
		matrix.matrix[1][3] = 0;
		matrix.matrix[2][0] = m.matrix[0][2]; 
		matrix.matrix[2][1] = m.matrix[1][2]; 
		matrix.matrix[2][2] = m.matrix[2][2]; 
		matrix.matrix[2][3] = 0;
		matrix.matrix[3][0] = -(m.matrix[3][0] * matrix.matrix[0][0] + m.matrix[3][1] * matrix.matrix[1][0] + m.matrix[3][2] * matrix.matrix[2][0]);
		matrix.matrix[3][1] = -(m.matrix[3][0] * matrix.matrix[0][1] + m.matrix[3][1] * matrix.matrix[1][1] + m.matrix[3][2] * matrix.matrix[2][1]);
		matrix.matrix[3][2] = -(m.matrix[3][0] * matrix.matrix[0][2] + m.matrix[3][1] * matrix.matrix[1][2] + m.matrix[3][2] * matrix.matrix[2][2]);
		matrix.matrix[3][3] = 1;
		return matrix;
};

var distance3D = function(x1, y1, z1, x2, y2, z2) {
    return sqrt((x1-x2) * (x1-x2) + (y1-y2) * (y1-y2) + (z1-z2) * (z1-z2));
};

var sqDist3D = function(x1, y1, z1, x2, y2, z2) {
    return ((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)) + ((z2-z1) * (z2-z1));
};

var avgX = function(tri, sorting) {
    if(sorting === null || sorting === undefined) {
        
        return (tri.vertices[0].x + tri.vertices[1].x + tri.vertices[2].x) / 3; 
        
    }
    return (tri.sortVerts[0].x + tri.sortVerts[1].x + tri.sortVerts[2].x) / 3; 
};

var avgY = function(tri, sorting) {
    if(sorting === null || sorting === undefined) {
        
        return (tri.vertices[0].y + tri.vertices[1].y + tri.vertices[2].y) / 3;
    }
    return (tri.sortVerts[0].y + tri.sortVerts[1].y + tri.sortVerts[2].y) / 3;
};

var avgZ = function(tri, sorting) {
    if(sorting === null || sorting === undefined) {
        return (tri.vertices[0].z + tri.vertices[1].z + tri.vertices[2].z) / 3;    
    }
    return (tri.sortVerts[0].z + tri.sortVerts[1].z + tri.sortVerts[2].z) / 3;    
};

var triDistToCam = function(tri) {
    return distance3D(avgX(tri), avgY(tri), avgZ(tri), camera3D.x, camera3D.y, camera3D.z);   
};

var Frustum = function() {
    //var planes =     
    
    
};


var moveToPosition = function(rect, x, y, z) {
    
    var transMat = translateMatrix(x - rect.x, y - rect.y, z - rect.z);  
    var triangle;
    rect.x = x;
    rect.y = y;
    rect.z = z;
    
    for(var i in rect.mesh) {
        triangle = rect.mesh[i];
        triangle.vertices[0] = matrixMultiplyVector(transMat, triangle.vertices[0]);
        triangle.vertices[1] = matrixMultiplyVector(transMat, triangle.vertices[1]);
        triangle.vertices[2] = matrixMultiplyVector(transMat, triangle.vertices[2]);
        rect.mesh[i] = triangle;
    }
    
};
var collideWithRectangle = function(r) {
    var w = camDims.w / 2;
    var h = camDims.h;
    var d = camDims.d / 2;
    
    if(distance3D(camera3D.x, camera3D.y, camera3D.z, r.x+(r.w/2), r.y+(r.h/2), r.z+(r.d/2)) < (r.w+h)*1.4) {
    
        var ld = r.d/20;
        var lh = r.h/20;
        var lw = r.w/20;
        //x
        if(camera3D.x+w > r.x && camera3D.x+w < r.x + r.w/3 && camera3D.y+h > r.y+lh && camera3D.y < r.y+r.h-lh && camera3D.z+d > r.z+ld && camera3D.z-d < r.z+r.d-ld) {
            camera3D.x = r.x-w; 
        }
        
        if(camera3D.x-w < r.x+r.w && camera3D.x-w > r.x+r.w-r.w/3 && camera3D.y+h > r.y+r.h+lh && camera3D.y < r.y+r.h+lh && camera3D.z+d > r.z+ld&& camera3D.z-d < r.z+r.d-ld) {
            camera3D.x = r.x+r.w+w;  
        
        }
        
        //y
        if(camera3D.y+h > r.y && camera3D.y+h < r.y + yVel*2 && camera3D.x+camera3D.w > r.x+lw && camera3D.x-w < r.x+r.w-lw && camera3D.z+d > r.z+ld && camera3D.z-d < r.z+r.d-ld) {
            camera3D.y = r.y-h;    
            canJump = true;
            yVel = 0;
        }
        
        if(camera3D.y < r.y+r.h && camera3D.y > r.y+r.h-speed*2 && camera3D.x+w > r.x+lw && camera3D.x-w < r.x+r.w -lw&& camera3D.z+d > r.z+ld && camera3D.z-d < r.z+r.d-ld) {
            camera3D.y = r.y+r.h;     
        }
        
        //z
        if(camera3D.z+d > r.z && camera3D.z+d < r.z + speed*2 && camera3D.y+h > r.y+lh && camera3D.y < r.y+r.h-lh && camera3D.x+w > r.x+lw && camera3D.x-w< r.x+r.w-lw) {
            camera3D.z = r.z-d;

        }
        
        if(camera3D.z-d < r.z+r.d && camera3D.z-d > r.z+r.d-speed*2 && camera3D.y+h > r.y+lh && camera3D.y < r.y+r.h -lh&& camera3D.x+w > r.x+lw && camera3D.x-w < r.x+r.w-lw) {
            camera3D.z = r.z+r.d+d;     
            
        }
    
    }
};
var generateRectangle = function(config) {
    var w = config.w;
    var h = config.h; 
    var d = config.d;
    
    var verts = [
        {x: 0, y: 0, z: 0 }, //0 0 0  0
        {x: 0, y: h, z: 0 }, //0 1 0  1
        {x: w, y: h, z: 0 }, //1 1 0  2
        {x: w, y: 0, z: 0 }, //1 0 0  3
        {x: 0, y: h, z: d }, //0 1 1  4
        {x: w, y: h, z: d }, //1 1 1  5
        {x: w, y: 0, z: d }, //1 0 1  6
        {x: 0, y: 0, z: d }, //0 0 1  7
    ];

    return {
        x: config.x,
        y: config.y,
        z: config.z,
        w: config.w,
        h: config.h,
        d: config.d,
        col: config.col, 
        mesh: [
            //South
            {vertices: [verts[0], verts[1], verts[2]], col: config.col},
            {vertices: [verts[0], verts[2], verts[3]], col: config.col},
            //East
            {vertices: [verts[3], verts[2], verts[5]], col: config.col},
            {vertices: [verts[3], verts[5], verts[6]], col: config.col},
            //North
            {vertices: [verts[6], verts[5], verts[4]], col: config.col},
            {vertices: [verts[6], verts[4], verts[7]], col: config.col},
            //West
            {vertices: [verts[7], verts[4], verts[1]], col: config.col},
            {vertices: [verts[7], verts[1], verts[0]], col: config.col},
            //Top
            {vertices: [verts[1], verts[4], verts[5]], col: config.col},
            {vertices: [verts[1], verts[5], verts[2]], col: config.col},
            //Bottom
            {vertices: [verts[6], verts[7], verts[0]], col: config.col},
            {vertices: [verts[6], verts[0], verts[3]], col: config.col},
        ],
        
    };
};

var makeBlock = function(i, j, x, y, z, col) {
    chunks[i][j].blocks[y][x][z] = generateRectangle({
        x: 0,
        y: 0,
        z: 0,
        w: blockSize,
        h: blockSize,
        d: blockSize,
        col: col,
    });
    moveToPosition(chunks[i][j].blocks[y][x][z], x * blockSize + (i * chunkSize * blockSize), y * blockSize, z * blockSize + (j * chunkSize * blockSize));
};
//} -- Rectangle

// {
var xOff = 0;
var noiseMap = new Array(chunkSize*maxWorldSize);
for(var i = 0; i < noiseMap.length; i++) {
    var zOff = 0;
    noiseMap[i] = new Array(chunkSize*maxWorldSize);
    for(var j = 0; j < noiseMap.length; j++) {
         
        var n = map(noise(xOff, zOff), 0, 1, -10, 30) + 5;
        noiseMap[i][j] = n;
        zOff += 0.025;
    }
    xOff += 0.025;
}


var makeTree = function(i, j, y, x, z) {
    var h = floor(random(4, y-2));
    for(var a = 0; a < h; a++) {
        if(chunks[i][j].blocks[y-a][x][z] === undefined) {
            makeBlock(i, j, x, y-a, z, color(125, 66, 7));
        }
    }
    
    if(x === 0) {
        if(i > 0) {
        makeBlock(i-1, j, chunkSize-1, y-(a-1), z, color(16, 133, 5));
        makeBlock(i-1, j, chunkSize-1, y-a, z, color(16, 133, 5));
        
        }
    }else {
        makeBlock(i, j, x-1, y-(a-1), z, color(16, 133, 5));    
        makeBlock(i, j, x-1, y-a, z, color(16, 133, 5));
    }
    
    if(z === 0) {
        if(j > 0) {
            makeBlock(i, j-1, x, y-(a-1), chunkSize-1, color(16, 133, 5));
            makeBlock(i, j-1, x, y-a, chunkSize-1, color(16, 133, 5));
        
        }
    }else {
        makeBlock(i, j, x, y-(a-1), z-1, color(16, 133, 5));    
        makeBlock(i, j, x, y-a, z-1, color(16, 133, 5));
    }
    
    if(x === chunkSize) {
        if(i < chunks.length-1) {
            makeBlock(i, j, 0, y-(a-1), z, color(16, 133, 5));      
        }
    }
    
};

var findVisibleFaces = function(chunk) {
    var faces = [];
    
    var blocks = chunk.blocks;
    var ly, gy, lx, gx, lz, gz;
    for(var y = 0; y < blocks.length; y++) {
        for(var x = 0; x < blocks[y].length; x++) {
            for(var z = 0; z < blocks[y][x].length; z++) {
                if(blocks[y][x][z] !== undefined) {
                  
                    var chunkX = floor(blocks[y][x][z].x/blockSize/chunkSize);
                    var chunkZ = floor(blocks[y][x][z].z/blockSize/chunkSize);
                   
                    if(y === 0) {
                        faces.push(blocks[y][x][z].mesh[10]);    
                        faces.push(blocks[y][x][z].mesh[11]);    
                    }else {
                        if(blocks[y - 1][x][z] === undefined) {
                            faces.push(blocks[y][x][z].mesh[10]);    
                            faces.push(blocks[y][x][z].mesh[11]);    
                        }    
                    }
                
                    if(x === 0) {
                        if(chunkX > 0) {    
                            if(chunks[chunkX-1][chunkZ].blocks[y][(chunkSize-1)-x][z] === undefined) {
                                faces.push(blocks[y][x][z].mesh[6]);    
                                faces.push(blocks[y][x][z].mesh[7]);
                            }
                        }else {
                            faces.push(blocks[y][x][z].mesh[6]);    
                            faces.push(blocks[y][x][z].mesh[7]);
                        }
                    }else {
                        if(blocks[y][x - 1][z] === undefined) {
                            faces.push(blocks[y][x][z].mesh[6]);    
                            faces.push(blocks[y][x][z].mesh[7]);
                        }
                    }
                    
                    if(z === 0) {
                        if(chunkZ > 0) {    
                            if(chunks[chunkX][chunkZ - 1].blocks[y][x][(chunkSize-1)-z] === undefined) {
                                faces.push(blocks[y][x][z].mesh[1]);    
                                faces.push(blocks[y][x][z].mesh[0]);
                            }
                        }else {
                            faces.push(blocks[y][x][z].mesh[0]);    
                            faces.push(blocks[y][x][z].mesh[1]);
                        }
                    }else {
                        if(blocks[y][x][z - 1] === undefined) {
                            faces.push(blocks[y][x][z].mesh[0]);    
                            faces.push(blocks[y][x][z].mesh[1]);
                        }
                    }
       
                    if(x === chunkSize - 1) {
                        
                        if(chunkX < chunks.length - 1) {
                            
                            if(chunks[chunkX + 1][chunkZ].blocks[y][(chunkSize-1)-x][z] === undefined) {
                                faces.push(blocks[y][x][z].mesh[2]);    
                                faces.push(blocks[y][x][z].mesh[3]);
                            }
                        }else {
                            faces.push(blocks[y][x][z].mesh[2]);    
                            faces.push(blocks[y][x][z].mesh[3]);
                        }  
                    }else {
                        if(blocks[y][x + 1][z] === undefined) {
                            faces.push(blocks[y][x][z].mesh[2]);    
                            faces.push(blocks[y][x][z].mesh[3]);       
                        }    
                    }
       
                    if(y === chunkHeight - 1) {
                        faces.push(blocks[y][x][z].mesh[8]);    
                        faces.push(blocks[y][x][z].mesh[9]);    
                    }else {
                        if(blocks[y + 1][x][z] === undefined) {
                            faces.push(blocks[y][x][z].mesh[8]);    
                            faces.push(blocks[y][x][z].mesh[9]);       
                        }
                    }
                    
                    if(z === chunkSize - 1) {
                        if(chunkZ < chunks[0].length - 1) {
                            if(chunks[chunkX][chunkZ + 1].blocks[y][x][(chunkSize-1)-z] === undefined) {
                                faces.push(blocks[y][x][z].mesh[4]);    
                                faces.push(blocks[y][x][z].mesh[5]);
                            }
                        }else {
                            faces.push(blocks[y][x][z].mesh[4]);    
                            faces.push(blocks[y][x][z].mesh[5]);
                        }      
                    }else {
                        if(blocks[y][x][z + 1] === undefined) {
                            faces.push(blocks[y][x][z].mesh[4]);    
                            faces.push(blocks[y][x][z].mesh[5]);       
                        }
                        
                    }
                    
                }
            }
        }
    }
    
    return faces;
};

var removeBlocksCamera = function() {
    var i = constrain(floor(camera3D.x/blockSize/chunkSize), 0, chunks.length-1);
    var j = constrain(floor(camera3D.z/blockSize/chunkSize), 0, chunks[0].length-1);

    for(var y = 0; y < chunks[i][j].blocks.length; y++) {
        for(var x = 0; x < chunks[i][j].blocks[y].length; x++) {
            for(var z = 0;z < chunks[i][j].blocks[y][x].length;z++) {
                if(chunks[i][j].blocks[y][x][z] !== undefined) {
                    if(distance3D(camera3D.x, camera3D.y, camera3D.z, chunks[i][j].blocks[y][x][z].x+blockSize/2, chunks[i][j].blocks[y][x][z].y+blockSize/2, chunks[i][j].blocks[y][x][z].z+blockSize/2) < blockSize) {
                        chunks[i][j].blocks[y][x][z] = undefined;                          
                        if(x === 0 && i !== 0) {
                            chunks[i-1][j].facesVisible = findVisibleFaces(chunks[i-1][j]);
                        }
                        
                        if(x === chunkSize-1 && i !== chunks[i].length-1) {
                            chunks[i+1][j].facesVisible = findVisibleFaces(chunks[i+1][j]);
                        }
                        if(z === 0 && j !== 0) {
                            chunks[i][j-1].facesVisible = findVisibleFaces(chunks[i][j-1]);
                        }
                        if(z === chunkSize-1 && j !== chunks[0].length-1) {
                            chunks[i][j+1].facesVisible = findVisibleFaces(chunks[i][j+1]);
                        }
                        chunks[i][j].facesVisible = findVisibleFaces(chunks[i][j]);
                    
                    }
                }
            }
        }
    }

};

var genChunk = function(i, j) {
    
    for(var y = 0; y < chunkHeight; y++) {
        chunks[i][j].blocks[y] = new Array(chunkSize);
        
        for(var x = 0; x < chunkSize; x++) {
            chunks[i][j].blocks[y][x] = new Array(chunkSize);
            for(var z = 0; z < chunkSize; z++) {
                var col;
                var canMakeTree = false;
                
                if(y <= 16) {
                    var col = color(20, 150, 20);
                    if(random(0, 100) < treeChance) {
                        canMakeTree = true;    
                    }
                }
                if(y > 16) {
                    col = color(150, 95, 6);
                }
                if(y > 20) {
                    col = color(92, 89, 88);
                }
                
                var h = noiseMap[i*chunkSize+x][j*chunkSize+z];
                if(y > h) {
                    if(canMakeTree && y-h <= 0.8) {
                        
                        makeTree(i, j, y, x, z);    
                    }
                    
                    makeBlock(i, j, x, y, z, col);
                }
            }
        }
    }
       
};

var makeNewChunks = delag(function() {
    var px = constrain(floor(camera3D.x/blockSize/chunkSize), 0, chunks.length-1);
    var pz = constrain(floor(camera3D.z/blockSize/chunkSize), 0, chunks[0].length-1);

    if(px >= chunks[0].length-2 && chunks[0].length < maxWorldSize) {
        
        for(var i = 0; i < chunks.length; i++) {
            
            chunks[i].push({blocks: new Array(chunkHeight), facesVisible: []});
            var j = chunks[i].length-1;
            genChunk(i, j);
        }
        for(var i in chunks) {
            for(var j in chunks[i]) {
                chunks[i][j].facesVisible = findVisibleFaces(chunks[i][j]);
            }
        }
    }
    
    if(pz >= chunks.length-2 && chunks.length < maxWorldSize) {
        chunks.push(new Array(chunks[0].length));
        var i = chunks.length-1;
        for(var j = 0; j < chunks[i].length; j++) {    
            
            chunks[i][j] = {blocks: new Array(chunkHeight), facesVisible: []};
            genChunk(i, j);
        }  
        
        for(var i in chunks) {
            for(var j in chunks[i]) {
                chunks[i][j].facesVisible = findVisibleFaces(chunks[i][j]);
            }
        }
    }
    
    
});

var chunkCollidePlayer = delag(function() {
    var i = constrain(floor(camera3D.x/blockSize/chunkSize), 0, chunks.length-1);
    var j = constrain(floor(camera3D.z/blockSize/chunkSize), 0, chunks[0].length-1);
    
    for(var y = 0; y < chunks[i][j].blocks.length; y++) {
      for(var x = 0; x < chunks[i][j].blocks[y].length; x++) {
        for(var z = 0; z < chunks[i][j].blocks[y][x].length; z++) {

            if(chunks[i][j].blocks[y][x][z] !== undefined) {
                //if(y*blockSize <= camera3D.y+(camDims.h*2) && y*blockSize >= camera3D.y-(camDims.h*2)) {
                    collideWithRectangle(chunks[i][j].blocks[y][x][z]);
                //}
            }
        }
      }
    }
});

var resetTriangleValues = function(tri) {
    setVectorValues(tri.vertices[0]);
    setVectorValues(tri.vertices[1]);
    setVectorValues(tri.vertices[2]);    
};

var lastTime = millis();
var lastFrame = millis();
var countFps = function() {
    var now = millis();
    var elapsed = now - lastTime;
    if (elapsed > 1500) {
        fps = round(1000 * (frameCount - lastFrame) / elapsed);
        lastTime = now;
        lastFrame = frameCount;
    }
};

var trianglesToDisplay = [];

var o = {x: 0, y: 0, z: 0 , };//vector to reduce memory usage

var displayed, avgDistanceToCamera;

var a = 0;
var yaw = 0;
var pitch = 0;
var m = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};

var t = {vertices: [o, o, o]};

var upVector = o, lookDir = {x: 0, y: 0, z: 0 , },lookDir2 = {x: 0, y: 0, z: 0 , }, targetVector = o;

var matCamera = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],}, matCameraRotY = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],},matCameraRotX = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],}, viewMat = {matrix: [[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],};

var triTransformed = t, triViewed = t, triPushed = t;

var triNormal = o, line1 = o, line2 = o, cameraRay = o;

var offsetView = m, dp, lightDirection = o;

var worldMat = m;

var projMat; 

var trisToDisplay = [];
var render = delag(function(objects) {
    projMat = makeProjectionMatrix(fov, 0.1, 1000);
    
    trisToDisplay = [];
    upVector = setVectorValues(upVector, 0, 1, 0);
    targetVector = setVectorValues(targetVector, 0, 0, 1);
    matCameraRotY = matrixRotateY(yaw);
    //matCameraRotX = matrixRotateX(pitch);
    lookDir = matrixMultiplyVector(matCameraRotY, targetVector);
    targetVector = addVectors(camera3D, lookDir);
    //targetVector = addVectors(targetVector, lookDir);
    matCamera = matrixPointAt(camera3D, targetVector, upVector);
    viewMat = quickInverseMatrix(matCamera);
    worldMat = makeIdentity();
    for(var i in objects) {
        
    for(var j in objects[i]) {
    
    if(dist(i*blockSize*chunkSize+(blockSize*chunkSize/2), j*blockSize*chunkSize+(blockSize*chunkSize/2), camera3D.x, camera3D.z) > renderDistance*blockSize*chunkSize+(blockSize*chunkSize*1.5)) {
        continue;    
    }
     
    for(var q in objects[i][j].facesVisible) {
        
        var tri = objects[i][j].facesVisible[q];
        
        resetTriangleValues(triTransformed);
        var triProjected = {vertices: [o, o, o]};
        resetTriangleValues(triViewed);
        
        triTransformed.vertices[0] = matrixMultiplyVector(worldMat, tri.vertices[0]);
        triTransformed.vertices[1] = matrixMultiplyVector(worldMat, tri.vertices[1]);
        triTransformed.vertices[2] = matrixMultiplyVector(worldMat, tri.vertices[2]);

        setVectorValues(triNormal); 
        setVectorValues(line1); 
        setVectorValues(line2); 

        line1 = subtractVectors(triTransformed.vertices[1], triTransformed.vertices[0]);
        line2 = subtractVectors(triTransformed.vertices[2], triTransformed.vertices[0]);
        
        triNormal = crossProduct(line1, line2);
        
        triNormal = triNormaliseVector(triNormal);
        cameraRay = subtractVectors(triTransformed.vertices[0], camera3D);

        if (dotProduct(triNormal, cameraRay) < 0) {
            //var d = distance3D(avgX(tri), avgY(tri), avgZ(tri), camera3D.x, camera3D.y, camera3D.z);
            //if(d < renderDistance) {
            
            triViewed.vertices[0] = matrixMultiplyVector(viewMat, triTransformed.vertices[0]);
            triViewed.vertices[1] = matrixMultiplyVector(viewMat, triTransformed.vertices[1]);
            triViewed.vertices[2] = matrixMultiplyVector(viewMat, triTransformed.vertices[2]);
            
            triProjected.vertices[0] = matrixMultiplyVector(projMat, triViewed.vertices[0]);
            triProjected.vertices[1] = matrixMultiplyVector(projMat, triViewed.vertices[1]);
            triProjected.vertices[2] = matrixMultiplyVector(projMat, triViewed.vertices[2]);
            
            triProjected.vertices[0].z = constrain(triProjected.vertices[0].z, 0.01, Infinity);  
            triProjected.vertices[1].z = constrain(triProjected.vertices[1].z, 0.01, Infinity);
            triProjected.vertices[2].z = constrain(triProjected.vertices[2].z, 0.01, Infinity);
            
            if(triProjected.vertices[0].z === 0.01 && triProjected.vertices[1].z === 0.01 && triProjected.vertices[2].z === 0.01) {
                continue;    
            }
            
            triProjected.vertices[0].x /= (triProjected.vertices[0].z * 0.1);
            triProjected.vertices[0].y /= (triProjected.vertices[0].z * 0.1);
            triProjected.vertices[1].x /= (triProjected.vertices[1].z * 0.1);
            triProjected.vertices[1].y /= (triProjected.vertices[1].z * 0.1);
            triProjected.vertices[2].x /= (triProjected.vertices[2].z * 0.1);
            triProjected.vertices[2].y /= (triProjected.vertices[2].z * 0.1);
            
            setVectorValues(lightDirection, 0, -1, -0.6); 
            lightDirection = triNormaliseVector(lightDirection);
            dp = max(0, dotProduct(lightDirection,triNormal))*50;
            
            var ambient = avgY(tri)*1.5;
            
            trisToDisplay.push({
                vertices: [triProjected.vertices[0], triProjected.vertices[1], triProjected.vertices[2]],
                sortVerts: [tri.vertices[0], tri.vertices[1], tri.vertices[2]],
                col: color(red(objects[i][j].facesVisible[q].col)+dp-ambient,green(objects[i][j].facesVisible[q].col)+dp-ambient,blue(objects[i][j].facesVisible[q].col)+dp-ambient)
            });
        //}
        }
    }
    }
    }
    
    
    trisToDisplay = trisToDisplay.sort(function(a, b) {
        return  sqDist3D(avgX(b, 1), avgY(b, 1), avgZ(b, 1), camera3D.x, camera3D.y, camera3D.z) - sqDist3D(avgX(a, 1), avgY(a, 1), avgZ(a, 1), camera3D.x, camera3D.y, camera3D.z); 
    });
    
    for(var i in trisToDisplay) {
	    fill(trisToDisplay[i].col);
	    //noFill();
        stroke(trisToDisplay[i].col);
        triangle(trisToDisplay[i].vertices[0].x, trisToDisplay[i].vertices[0].y, trisToDisplay[i].vertices[1].x, trisToDisplay[i].vertices[1].y, trisToDisplay[i].vertices[2].x, trisToDisplay[i].vertices[2].y); 
    }
    
    trisToDisplay = [];
});

//} -- Displaying to screen & calculations 

// {
var makeWorld = delag(function() {
    
    for(var i = 0; i < numChunks; i++) {
        chunks[i] = new Array(numChunks); 
        for(var j = 0; j < numChunks; j++) {
            chunks[i][j] = {blocks : new Array(chunkHeight), facesVisible: []};
            genChunk(i, j);
        }   
    }
    
    for(var i in chunks) {
        for(var j in chunks[i]) {
            chunks[i][j].facesVisible = findVisibleFaces(chunks[i][j]);
        
        }
    }
});

makeWorld();

//} -- World Gen

var keys = [];
keyPressed = function() {
    keys[keyCode] = true;
};
keyReleased = function() {
    keys[keyCode] = false;    
};
var forwardVector, sideVector;

var previousTime = millis();
var nowTime = 0;

var runMovement = delag(function() {
    var cam = camera3D;
    yVel = 0;
    nowTime = millis();
    var curSpeed = speed;
    forwardVector = multiplyVector(lookDir, curSpeed);
    sideVector = matrixMultiplyVector(matrixRotateY(90), forwardVector);
    
    if(keys[LEFT])  {yaw += ((nowTime-previousTime)/13); }
    if(keys[RIGHT]) {yaw -= ((nowTime-previousTime)/13); }
    if(keys[UP])  {pitch += ((nowTime-previousTime)/13); }
    if(keys[DOWN]){pitch -= ((nowTime-previousTime)/13); }
    if(yaw > 360)  {yaw = yaw-360; }
    if(yaw < 0) {yaw = yaw+360; }

    if(keys[65]) {
        cam = addVectors(cam, sideVector);
        
    }
    if(keys[68]) {
        cam = subtractVectors(cam, sideVector);
        
    }
    if(keys[87]) {
        cam = addVectors(cam, forwardVector);
        
    }
    if(keys[83]) {
        cam = subtractVectors(cam, forwardVector);
        
    }
 
    if(keys[32]) {
        yVel = -curSpeed;
    }
    
    if(keys[16]) {
        cam.y += curSpeed; 
        
    }
    
    previousTime = millis();
    
    return cam;
});

draw = delag(function() {
    
    //chunkCollidePlayer();
    
    camera3D = runMovement();
    
    makeNewChunks();  
    //removeBlocksCamera();
    background(200);
    pushMatrix();
    translate(width/2, height/2);
    render(chunks);
    popMatrix();
    
    countFps();
    fill(0);
    text(fps, 20, 20);
    
    //yVel += gravity;
    camera3D.y += yVel;
    
});
    
