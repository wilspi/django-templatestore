{ nixpkgs ? import <nixpkgs> {}, version, sha256 }:

let
  inherit (nixpkgs) python37 utillinux stdenv autoPatchelfHook fetchurl binutils-unwrapped patchelf xcbuild;
  inherit (stdenv) mkDerivation;

in
mkDerivation {
  inherit version;

  name = "nodejs-${version}";
  src = fetchurl {
    url = "https://nodejs.org/dist/v${version}/node-v${version}${if stdenv.isDarwin then "-darwin-x64" else "-linux-x64"}.tar.xz";
    inherit sha256;
  };

  # Dependencies for building node.js (Python and utillinux on Linux, just Python on Mac)
  buildInputs = with nixpkgs; [ xcbuild binutils-unwrapped patchelf glib python37 ] ++ stdenv.lib.optional stdenv.isLinux utillinux;
  nativeBuildInputs = with nixpkgs; [ autoPatchelfHook ];

  installPhase = ''
    echo "installing nodejs"
    mkdir -p $out
    cp -r ./ $out/
  '';

  meta = with stdenv.lib; {
    description = "Event-driven I/O framework for the V8 JavaScript engine";
    homepage = "https://nodejs.org";
    license = licenses.mit;
  };

  passthru.python = python37;
}
