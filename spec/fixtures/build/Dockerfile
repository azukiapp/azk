FROM azukiapp/azktcl:0.0.2
MAINTAINER Azuki <support@azukiapp.com>

ADD file_to_add /file_to_add
ADD file2_dir/file2_to_add /run.sh
ADD dir_to_add /dir_to_add

RUN chmod +x /run.sh

CMD /run.sh
