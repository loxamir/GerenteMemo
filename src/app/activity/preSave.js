console.log("teste de salvamento", this.workForm.value);
this.formatService.asyncForEach(this.workForm.value.loads, async (item)=>{
  console.log("has move", item.doc_id);
  if(item.doc_id){
    let update = await this.updateDoc(item.doc_id, [{
      'quantity': parseFloat(item.quantity),
    }]);
    console.log("existent doc_id", item.doc_id);
    console.log("update", update);
  } else {
    let move = await this.createDoc({
      'name': "Colheita ",
      'quantity': parseFloat(item.quantity),
      'origin_id': this.workForm.value._id,
      'contact_id': 'contact.myCompany',
      'contact_name': this.config.name,
      'product_id': this.workForm.value.crop.product_id,
      'product_name': this.workForm.value.crop.product_name,
      'docType': "stock-move",
      'date': new Date(),
      'cost': 0,
      'warehouseFrom_id': this.config.warehouse_id,
      'warehouseFrom_name': "Roça",
      'warehouseTo_id': 'warehouse.client',
      'warehouseTo_name': "Cliente",
    });

    console.log("cvvreate doc_id", move);
    item.doc_id = move.id;
  }
}).then((data)=>{
  console.log("data", data);
  console.log("loads", this.workForm.value.loads);
})
