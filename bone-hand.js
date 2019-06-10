// jshint -W030
module.exports = function(Leap, THREE) {
  var HandMesh, armTopAndBottomRotation, baseBoneRotation, boneColor, boneHandLost, boneRadius, boneScale, initScene, jointColor, jointRadius, jointScale, material, onHand, scope;

  scope = null;

  initScene = function(targetEl, scale) {
    var camera, far, height, near, renderer, width;
    scope.scene = new THREE.Scene();
    scope.rendererOps || (scope.rendererOps = {});
    if (scope.rendererOps.alpha === void 0) {
      scope.rendererOps.alpha = true;
    }
    scope.renderer = renderer = new THREE.WebGLRenderer(scope.rendererOps);
    width = scope.width || window.innerWidth;
    height = scope.height || window.innerHeight;
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.domElement.className = "leap-boneHand";
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    targetEl.appendChild(renderer.domElement);
    near = 1;
    far = 10000;
    if (scale) {
      near *= scale;
      far *= scale;
    }
    scope.camera = camera = new THREE.PerspectiveCamera(45, width / height, near, far);
    camera.position.set(0, 300, 500);
    camera.lookAt(new THREE.Vector3(0, 160, 0));
    scope.scene.add(camera);
    if (!scope.width && !scope.height) {
      window.addEventListener('resize', function() {
        width = window.innerWidth;
        height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        return renderer.render(scope.scene, camera);
      }, false);
    }
    scope.render || (scope.render = function(timestamp) {
      return renderer.render(scope.scene, scope.camera);
    });
    return scope.render();
  };

  baseBoneRotation = null;
  jointColor = null;
  boneColor = null;
  boneScale = null;
  jointScale = null;
  boneRadius = null;
  jointRadius = null;
  material = null;
  armTopAndBottomRotation = null;

  HandMesh = (function() {
    HandMesh.unusedHandMeshes = [];

    HandMesh.get = function() {
      var handMesh;
      if (HandMesh.unusedHandMeshes.length === 0) {
        handMesh = HandMesh.create();
      }
      handMesh = HandMesh.unusedHandMeshes.pop();
      handMesh.show();
      return handMesh;
    };

    HandMesh.prototype.replace = function() {
      this.hide();
      return HandMesh.unusedHandMeshes.push(this);
    };

    HandMesh.create = function() {
      var mesh;
      mesh = new HandMesh();
      mesh.setVisibility(false);
      HandMesh.unusedHandMeshes.push(mesh);
      if (HandMesh.onMeshCreated) {
        HandMesh.onMeshCreated(mesh);
      }
      return mesh;
    };

    function HandMesh() {
      var boneCount, finger, i, j, k, l, m, mesh, n, ref;
      material = !isNaN(scope.opacity) ? new THREE.MeshPhongMaterial({
        fog: false,
        transparent: true,
        opacity: scope.opacity
      }) : new THREE.MeshPhongMaterial({
        fog: false
      });
      boneRadius = 40 * boneScale;
      jointRadius = 40 * jointScale;
      this.fingerMeshes = [];
      for (i = k = 0; k < 5; i = ++k) {
        finger = [];
        boneCount = i === 0 ? 3 : 4;
        for (j = l = 0, ref = boneCount; 0 <= ref ? l < ref : l > ref; j = 0 <= ref ? ++l : --l) {
          mesh = new THREE.Mesh(new THREE.SphereGeometry(jointRadius, 32, 32), material.clone());
          mesh.name = "hand-bone-" + j;
          mesh.material.color.copy(jointColor);
          mesh.renderOrder = ((i * 9) + (2 * j)) / 36;
          mesh.castShadow = false;
          scope.scene.add(mesh);
          finger.push(mesh);
          
          //mesh = new THREE.Mesh(new THREE.CylinderGeometry(boneRadius, boneRadius, 40, 32), material.clone());
          mesh = new THREE.Mesh(new THREE.SphereGeometry(boneRadius, 32, 32), material.clone());
          mesh.name = "hand-joint-" + j;
          mesh.material.color.copy(boneColor);
          mesh.renderOrder = ((i * 9) + (2 * j) + 1) / 36;
          mesh.castShadow = false;
          scope.scene.add(mesh);
          finger.push(mesh);
        }
        mesh = new THREE.Mesh(new THREE.SphereGeometry(jointRadius, 32, 32), material.clone());
        mesh.material.color.copy(jointColor);
        mesh.castShadow = false;
        scope.scene.add(mesh);
        finger.push(mesh);
        this.fingerMeshes.push(finger);
      }
      if (scope.arm) {
        this.armMesh = new THREE.Object3D();
        this.armBones = [];
        this.armSpheres = [];
        for (i = m = 0; m <= 3; i = ++m) {
          this.armBones.push(new THREE.Mesh(new THREE.CylinderGeometry(boneRadius, boneRadius, (i < 2 ? 1000 : 100), 32), material.clone()));
          this.armBones[i].material.color.copy(boneColor);
          this.armBones[i].castShadow = true;
          this.armBones[i].name = "ArmBone" + i;
          if (i > 1) {
            this.armBones[i].quaternion.multiply(armTopAndBottomRotation);
          }
          this.armMesh.add(this.armBones[i]);
        }
        this.armSpheres = [];
        for (i = n = 0; n <= 3; i = ++n) {
          this.armSpheres.push(new THREE.Mesh(new THREE.SphereGeometry(jointRadius, 32, 32), material.clone()));
          this.armSpheres[i].material.color.copy(jointColor);
          this.armSpheres[i].castShadow = true;
          this.armSpheres[i].name = "ArmSphere" + i;
          this.armMesh.add(this.armSpheres[i]);
        }
        scope.scene.add(this.armMesh);
      }
    }

    HandMesh.prototype.traverse = function(callback) {
      var i, k, l, len, mesh, ref;
      for (i = k = 0; k < 5; i = ++k) {
        ref = this.fingerMeshes[i];
        for (l = 0, len = ref.length; l < len; l++) {
          mesh = ref[l];
          callback(mesh);
        }
      }
      return this.armMesh && this.armMesh.traverse(callback);
    };

    HandMesh.prototype.scaleTo = function(hand) {
      var armLenScale, armWidthScale, baseScale, bone, boneXOffset, finger, fingerBoneLengthScale, halfArmLength, i, j, k, l, mesh;
      // TODO: CRASH: middlefinger is undefined
      if (!hand.middleFinger) return this
      //baseScale = hand.middleFinger.proximal.length / this.fingerMeshes[2][1].geometry.parameters.height;
      baseScale = hand.middleFinger.proximal.length / 40
      for (i = k = 0; k < 5; i = ++k) {
        finger = hand.fingers[i];
        j = 0;
        while (true) {
          if (j === this.fingerMeshes[i].length - 1) {
            mesh = this.fingerMeshes[i][j];
            mesh.scale.set(baseScale, baseScale, baseScale);
            break;
          }
          bone = finger.bones[3 - (j / 2)];
          mesh = this.fingerMeshes[i][j];
          mesh.scale.set(baseScale, baseScale, baseScale);
          j++;
          mesh = this.fingerMeshes[i][j];
          //fingerBoneLengthScale = bone.length / mesh.geometry.parameters.height;
          //mesh.scale.set(baseScale, fingerBoneLengthScale, baseScale);
          mesh.scale.set(baseScale, baseScale, baseScale);
          j++;
        }
      }
      if (scope.arm) {
        armLenScale = hand.arm.length / (this.armBones[0].geometry.parameters.height + this.armBones[0].geometry.parameters.radiusTop);
        armWidthScale = hand.arm.width / (this.armBones[2].geometry.parameters.height + this.armBones[2].geometry.parameters.radiusTop);
        for (i = l = 0; l <= 3; i = ++l) {
          this.armBones[i].scale.set(baseScale, (i < 2 ? armLenScale : armWidthScale), baseScale);
          this.armSpheres[i].scale.set(baseScale, baseScale, baseScale);
        }
        boneXOffset = (hand.arm.width / 2) * 0.85;
        halfArmLength = hand.arm.length / 2;
        this.armBones[0].position.setX(boneXOffset);
        this.armBones[1].position.setX(-boneXOffset);
        this.armBones[2].position.setY(halfArmLength);
        this.armBones[3].position.setY(-halfArmLength);
        this.armSpheres[0].position.set(-boneXOffset, halfArmLength, 0);
        this.armSpheres[1].position.set(boneXOffset, halfArmLength, 0);
        this.armSpheres[2].position.set(boneXOffset, -halfArmLength, 0);
        this.armSpheres[3].position.set(-boneXOffset, -halfArmLength, 0);
      }
      return this;
    };

    HandMesh.prototype.formTo = function(hand) {
      var bone, finger, i, j, k, mesh;
      for (i = k = 0; k < 5; i = ++k) {
        finger = hand.fingers[i];
        j = 0;
        while (true) {
          if (j === this.fingerMeshes[i].length - 1) {
            mesh = this.fingerMeshes[i][j];
            mesh.position.fromArray(bone.prevJoint);
            break;
          }
          bone = finger.bones[3 - (j / 2)];
          mesh = this.fingerMeshes[i][j];
          mesh.position.fromArray(bone.nextJoint);
          ++j;
          mesh = this.fingerMeshes[i][j];
          mesh.position.fromArray(bone.center());
          //mesh.setRotationFromMatrix((new THREE.Matrix4()).fromArray(bone.matrix()));
          //mesh.quaternion.multiply(baseBoneRotation);
          ++j;
        }
      }
      if (this.armMesh) {
        this.armMesh.position.fromArray(hand.arm.center());
        this.armMesh.setRotationFromMatrix((new THREE.Matrix4()).fromArray(hand.arm.matrix()));
        this.armMesh.quaternion.multiply(baseBoneRotation);
      }
      return this;
    };

    HandMesh.prototype.setVisibility = function(visible) {
      var i, j, k, l, results;
      for (i = k = 0; k < 5; i = ++k) {
        j = 0;
        while (true) {
          this.fingerMeshes[i][j].visible = visible;
          ++j;
          if (j === this.fingerMeshes[i].length) {
            break;
          }
        }
      }
      if (scope.arm) {
        results = [];
        for (i = l = 0; l <= 3; i = ++l) {
          this.armBones[i].visible = visible;
          results.push(this.armSpheres[i].visible = visible);
        }
        return results;
      }
    };

    HandMesh.prototype.show = function() {
      return this.setVisibility(true);
    };

    HandMesh.prototype.hide = function() {
      return this.setVisibility(false);
    };

    return HandMesh;

  })();

  onHand = function(hand) {
    var handMesh;
    if (!scope.scene) {
      return;
    }
    handMesh = hand.data('handMesh');
    if (!handMesh) {
      handMesh = HandMesh.get().scaleTo(hand);
      hand.data('handMesh', handMesh);
      if (HandMesh.onMeshUsed) {
        HandMesh.onMeshUsed(handMesh);
      }
    }
    return handMesh.formTo(hand);
  };

  boneHandLost = function(hand) {
    var handMesh;
    handMesh = hand.data('handMesh');
    if (handMesh) {
      handMesh.replace();
    }
    return handMesh = hand.data('handMesh', null);
  };

  return function boneHand(options) {
    var controller, scale;
    if (options == null) {
      options = {};
    }
    scope = options;
    controller = this;
    jointColor = (new THREE.Color()).setHex(0x5daa00);
    boneColor = (new THREE.Color()).setHex(0xffffff);
    scope.boneScale && (boneScale = scope.boneScale);
    scope.jointScale && (jointScale = scope.jointScale);
    scope.boneColor && (boneColor = scope.boneColor);
    scope.jointColor && (jointColor = scope.jointColor);
    scope.HandMesh = HandMesh;
    scope.addShadowCamera = function() {
      scope.light = new THREE.SpotLight(0xffffff, 1);
      scope.light.castShadow = true;
      scope.light.shadow.mapSize.width = 1024;
      scope.light.shadow.mapSize.height = 1024;
      scope.light.shadow.camera.near = 0.5 / 0.001;
      scope.light.shadow.camera.far = 3 / 0.001;
      scope.light.position.set(0, 1000, 1000);
      scope.light.target.position.set(0, 0, -1000);
      scope.camera.add(scope.light.target);
      scope.camera.add(scope.light);
      if (controller.plugins.transform) {
        if (controller.plugins.transform.getScale()) {
          scope.light.shadowCameraNear *= controller.plugins.transform.scale.x;
          scope.light.shadowCameraFar *= controller.plugins.transform.scale.x;
          scope.light.target.position.multiply(controller.plugins.transform.scale);
          scope.light.position.multiply(controller.plugins.transform.scale);
        }
        if (controller.plugins.transform.vr === true) {
          scope.camera.position.set(0, 0, 0);
        }
        if (controller.plugins.transform.vr === 'desktop') {
          return scope.camera.position.set(0, 0.15, 0.3);
        }
      }
    };
    baseBoneRotation = (new THREE.Quaternion()).setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    boneScale = 1 / 6;
    jointScale = 1 / 5;
    boneRadius = null;
    jointRadius = null;
    material = null;
    armTopAndBottomRotation = (new THREE.Quaternion()).setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
    HandMesh.onMeshCreated = function(mesh) {
      return controller.emit('handMeshCreated', mesh);
    };
    HandMesh.onMeshUsed = function(mesh) {
      return controller.emit('handMeshUsed', mesh);
    };
    this.use('handEntry');
    this.use('handHold');
    if (scope.scene === void 0) {
      console.assert(scope.targetEl);
      if (this.plugins.transform && this.plugins.transform.getScale()) {
        scale = this.plugins.transform.scale.x;
      }
      initScene(scope.targetEl, scale);
      scope.addShadowCamera();
    }
    if (scope.scene) {
      HandMesh.create();
      HandMesh.create();
      if (Leap.version.major === 0 && Leap.version.minor < 7 && Leap.version.dot < 4) {
        console.warn("BoneHand default scene render requires LeapJS > 0.6.3. You're running have " + Leap.version.full);
      }
      this.on('frameEnd', function(timestamp) {
        if (scope.render) {
          return scope.render(timestamp);
        }
      });
    }
    this.on('handLost', boneHandLost);
    return {
      hand: onHand
    };
  }

}
