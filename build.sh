git submodule init
git submodule update
patch -p1 node-churn/deps/node/src/node_file.cc < bigfiles.patch 
cd node-churn/deps/node
./configure
make

