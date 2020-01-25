{ nixpkgs ? import <nixpkgs> {}, version, sha256 }:

let
  inherit (nixpkgs) stdenv autoPatchelfHook fetchurl binutils-unwrapped patchelf fetchurl;
  inherit (stdenv) mkDerivation;

in
mkDerivation {
  inherit version;

  name = "nodejs-${version}";
  src = fetchurl {
    url = "https://nodejs.org/dist/v${version}/node-v${version}-linux-x64.tar.xz";
    inherit sha256;
  };

  # QUESTION: put glib and autoPatchelfHook in nativeBuildInputs or buildInputs?
  nativeBuildInputs = with nixpkgs; [ glib patchelf binutils-unwrapped autoPatchelfHook ];
  #buildInputs = with nixpkgs; [glib];

  installPhase = ''
    echo "installing nodejs"
    mkdir -p $out
    cp -R ./ $out/
  '';

  meta = with stdenv.lib; {
    description = "Event-driven I/O framework for the V8 JavaScript engine";
    homepage = "https://nodejs.org";
    license = licenses.mit;
  };

  #TODO do I need this?
  #passthru.python = python2; # to ensure nodeEnv uses the same version
}

# https://discourse.nixos.org/t/managing-multiple-versions-of-node-js-with-nix/5425/9
