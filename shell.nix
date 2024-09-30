 let
   nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/tarball/nixos-24.05";
   pkgs = import nixpkgs { config = {}; overlays = []; };
 in

 pkgs.mkShellNoCC {
   packages = with pkgs; [
     git
     vim
     kittysay
     lolcat
     nodejs
   ];

   HOWTO = ''
     Schau dir an was man hier tun kann mit:
     
     npm run 
   '';

   shellHook = ''
     echo -e "Hallo "$USER"!\n\n"$HOWTO | kittysay | lolcat
   '';
 }
