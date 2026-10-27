// Atelier RENDU de miniFusion — moteur « Lancer de rayons » (src/98-rendu-rayons.js).
// Empaquette three (récent, isolé du three r147 de la CAO), three-mesh-bvh et three-gpu-pathtracer en UN script
// classique, window.RDPT : il marche en file:// et n'est chargé qu'au choix du moteur. Pour le refaire (hors du dépôt) :
//   npm i three@0.186.1 three-mesh-bvh@0.9.16 three-gpu-pathtracer@0.0.27 esbuild
//   npx esbuild rendu-rayons-entree.mjs --bundle --minify --format=iife --global-name=RDPT --target=es2020 --legal-comments=eof --outfile=rendu-rayons.js
// puis recopier rendu-rayons.js dans threejs/ (en gardant le bandeau de licences en tête).
import {WebGLRenderer,Scene,Group,Mesh,BufferGeometry,BufferAttribute,MeshPhysicalMaterial,MeshStandardMaterial,DataTexture,
  Color,Matrix4,Vector2,Vector3,PlaneGeometry,CircleGeometry,LatheGeometry,RGBAFormat,FloatType,HalfFloatType,LinearFilter,EquirectangularReflectionMapping,
  RepeatWrapping,ClampToEdgeWrapping,DoubleSide,FrontSide,SRGBColorSpace,LinearSRGBColorSpace,NoToneMapping,ACESFilmicToneMapping,
  ReinhardToneMapping,CineonToneMapping,AgXToneMapping,NeutralToneMapping,REVISION} from 'three';
import {WebGLPathTracer,PhysicalCamera} from 'three-gpu-pathtracer';
// images HDRI importées (.hdr, .exr) — V0.14.0 : lues ici, servent aux deux moteurs de l'atelier
import {HDRLoader} from 'three/examples/jsm/loaders/HDRLoader.js';
import {EXRLoader} from 'three/examples/jsm/loaders/EXRLoader.js';
export const THREE={WebGLRenderer,Scene,Group,Mesh,BufferGeometry,BufferAttribute,MeshPhysicalMaterial,MeshStandardMaterial,DataTexture,
  Color,Matrix4,Vector2,Vector3,PlaneGeometry,CircleGeometry,LatheGeometry,RGBAFormat,FloatType,HalfFloatType,LinearFilter,EquirectangularReflectionMapping,
  RepeatWrapping,ClampToEdgeWrapping,DoubleSide,FrontSide,SRGBColorSpace,LinearSRGBColorSpace,NoToneMapping,ACESFilmicToneMapping,
  ReinhardToneMapping,CineonToneMapping,AgXToneMapping,NeutralToneMapping,REVISION};
export {WebGLPathTracer,PhysicalCamera,HDRLoader,EXRLoader};
