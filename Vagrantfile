# -*- mode: ruby -*-
# # vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "azk"
  config.vm.network "private_network", ip: "192.168.50.4"

  apps_path = File.expand_path(ENV["AZK_APPS_PATH"] || "~/Sites")
  data_path = File.expand_path(ENV["AZK_DATA_PATH"] || "./data")

  config.vm.synced_folder data_path, "/azk-nfs", id: "azk", :nfs => true, :mount_options => ['nolock,vers=3,udp']
  config.vm.synced_folder apps_path, "/azk-nfs/apps", id: "azk-apps", :nfs => true, :mount_options => ['nolock,vers=3,udp']
  config.bindfs.bind_folder "/azk-nfs", "/azk"
end
