# -*- mode: ruby -*-
# # vi: set ft=ruby :

require 'resolv'

Vagrant.configure("2") do |config|
  config.vm.box = "coreos"
  config.vm.box_url = "http://storage.core-os.net/coreos/amd64-generic/dev-channel/coreos_production_vagrant.box"
  config.vm.network "private_network", ip: Resolv.getaddress("azk-agent")

  azk_path  = File.expand_path(".")
  apps_path = File.expand_path(ENV["AZK_APPS_PATH"] || "~/Sites")
  data_path = File.expand_path(ENV["AZK_DATA_PATH"] || "./data")

  shared = {
    'azk' => [azk_path, "/home/core/azk"],
    'azk-data' => [data_path, "/home/core/azk/data"],
    'azk-apps' => [apps_path, "/home/core/azk/data/apps"],
  }

  shared.each do |key, value|
    config.vm.synced_folder(
      value[0], value[1], id: key, :nfs => true, :mount_options => ['nolock,vers=3,udp']
    )
  end

  # Provision
  config.vm.provision "shell", inline: "/home/core/azk/bin/azk agent-provision"

  # Fix docker not being able to resolve private registry in VirtualBox
  config.vm.provider :virtualbox do |vb, override|
    vb.customize ["modifyvm", :id, "--natdnshostresolver1", "on"]
    vb.customize ["modifyvm", :id, "--natdnsproxy1", "on"]
  end
end
