import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { PedidoDTO } from '../../models/pedido.dto';
import { CartItem } from '../../models/cart-tem';
import { CartService } from '../../services/domain/cart.service';
import { ClienteDTO } from '../../models/cliente.dto';
import { EnderecoDTO } from '../../models/endereco.dto';
import { ClienteService } from '../../services/domain/cliente.service';
import { PedidoService } from '../../services/domain/pedido.service';

@IonicPage()
@Component({
  selector: 'page-order-confirmation',
  templateUrl: 'order-confirmation.html',
})
export class OrderConfirmationPage {

  pedido: PedidoDTO;
  cartItems: CartItem[];
  cliente: ClienteDTO;
  endereco: EnderecoDTO;
  codPedido: string;

  constructor(public navCtrl: NavController, 
    public navParams: NavParams, 
    public cartService: CartService,
    public clienteService: ClienteService, 
    public pedidoService: PedidoService, 
    public loadingCtrl: LoadingController) {
    this.pedido = this.navParams.get('pedido');
  }

  ionViewDidLoad() {
    this.cartItems = this.cartService.getCart().items;
    this.clienteService.findById(this.pedido.cliente.id).subscribe(response => {
      this.cliente = response as ClienteDTO;
      this.endereco = this.findEndereco(this.pedido.enderecoDeEntrega.id, response['enderecos']);
    }, error => {this.navCtrl.setRoot('HomePage')});
  }

  private findEndereco(id: string, list: EnderecoDTO[]): EnderecoDTO {
    let position = list.findIndex(element => element.id == id);
    return list[position];
  }

  total() {
    return this.cartService.total();
  }

  checkout(){
    let loader = this.presentLoading();
    loader.present();
    this.pedidoService.insert(this.pedido).subscribe(response => {
      loader.dismiss();
      this.cartService.createOrClearCart();
      this.codPedido = this.extractId(response.headers.get('location'));
    }), error => {
      loader.dismiss();
      if(error.status == 403){
        this.navCtrl.setRoot('HomePage');
      }
    };
  }

  private extractId(location: string): string {
    let position = location.lastIndexOf("/");
    return location.substring(position + 1, location.length);
  }

  backToPreviousPage(){
    this.navCtrl.setRoot('CartPage');
  }

  navigateToHome(){
    this.navCtrl.setRoot('CategoriasPage');
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Carregando..."
    });
    return loader;
  }
}
