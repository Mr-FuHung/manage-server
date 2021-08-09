module.exports={
    apps:[
        {
            name:"manage_server",
            script:'./bin/www',
            cwd:'./',
            ignore_watch:['node_modules','logs','views','public'],//不监控的文件夹
            node_args:'--harmony',
            exec_mode: "cluster",
            env:{
                NODE_ENV:'prd'
            }
        },
    ]
}