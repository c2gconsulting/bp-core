//if local_ssl is set then use dev o365 credentials
//destroy o365 service configuration
ServiceConfiguration.configurations.remove({service: 'office365'});
if(process.env.LOCAL_SSL){
    console.log('local_ssl enabled');
    ServiceConfiguration.configurations.upsert({service: 'office365'}, {
        $set: {
            clientId: '4611d421-4e32-43f3-9b96-9952bedd822c',
            secret: 'vmgaKX623rcbVIMRL18)?|)',
            tenant: 'oomconsulting.onmicrosoft.com' // or 'common' for not specific tenant
        }
    });
} else {
    //use production instance at all time
    console.log('app running in non local ssl mode')
    ServiceConfiguration.configurations.upsert({service: 'office365'}, {
        $set: {
            clientId: '2fd4d318-adaf-4c4b-b329-db8b56d1afba',
            secret: 'ufytUFQWV35([xksOA805^!',
            tenant: 'erotonep.com' // or 'common' for not specific tenant
        }
    });

}