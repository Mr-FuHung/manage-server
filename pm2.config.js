module.exports={
    apps:[
        {
            name:"manage_server",
            script:'./bin/www',
            cwd:'./',
            ignore_watch:['node_modules','logs','views','public'],
            node_args:'--harmony',
            exec_mode: "cluster"
        },
    ]
}