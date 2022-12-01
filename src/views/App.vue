<template>
<!--000043   fb360-->
  <v-app>
    <!-- sidebar -->
    <v-navigation-drawer v-if="currentUser.name!='Felix'" color="#f4f5fa" v-model="drawer" :clipped="$vuetify.breakpoint.lgAndUp" app> <!--style="box-shadow: 0px 13px 5px 0px rgb(112 112 115 / 30%)!important;z-index: 9;"-->
      <!-- sidebar-menu -->
      <v-list class="pl-0 pr-4 pt-3 sidebar" dense> 

        <!-- dashboard -->
        <v-tooltip right open-delay="1000">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item to="/" link v-bind="attrs" v-on="on">
              <v-list-item-action class="mr-3">
                <v-icon>mdi-view-dashboard</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Dashboard</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>
          <span>Pantalla de inicio</span>
        </v-tooltip>

        <!-- Reportes -->
        <div v-show="permissions('reports')">
        <v-tooltip right open-delay="1000">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item to="/reports" v-bind="attrs" v-on="on">
              <v-list-item-action class="mr-3">
                <v-icon> mdi-chart-bar</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Reportes</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            </template>
          <span>Graficas mensuales y por día</span>
        </v-tooltip>
        </div>

        <v-divider class="ma-4"></v-divider>

        <!-- Actividades -->
        <v-expansion-panels class="sinsombra" v-show="permissions('activities')">
          <v-expansion-panel style="background:transparent!important;">
            <v-expansion-panel-header style="font-weight:500; font-size:0.8125rem; color:#202020;" class="px-4 py-0">
              <div>
                <v-icon class="mr-2">mdi-format-list-checks</v-icon> 
                Actividades
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>

              <!-- Calendario -->
              
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/calendar" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-calendar-multiple</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Calendario</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Agenda de cotizaciónes en seguimiento</span>
              </v-tooltip>
              
              
              <!-- Lista de Actividades -->
              
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/activities" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-checkbox-marked-outline</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Actividades</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de seguimientos de prospectos activos</span>
              </v-tooltip>
              

              <!-- Llamadas -->
              <div v-show="permissions('calls')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/calls" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-phone</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Llamadas</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Registro de llamadas call picker</span>
              </v-tooltip>
              </div>

              <!-- Mensajes -->
              <div v-show="permissions('messages')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/messages" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-message-minus-outline</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Mensajes</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Registro de conversacóones en WhatsApp, Facebook Messenger y Chat en Línea</span>
              </v-tooltip>
              </div>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>

        <!-- clientes -->
        <div v-show="permissions('companies')">
        <v-divider class="ma-4"></v-divider>
        <v-tooltip right open-delay="1000">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item to="/clients" link v-bind="attrs" v-on="on">
              <v-list-item-action class="mr-3">
                <v-icon> mdi-account-multiple</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Clientes</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            </template>
          <span>Lista de empresas a las que se les ha cotizado/vendido</span>
        </v-tooltip>
        </div>

        <!-- prospectos -->
        <div v-show="permissions('leads')">
        <v-tooltip right open-delay="1000">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item to="/leads" link v-bind="attrs" v-on="on">
              <v-list-item-action class="mr-3">
                <v-icon>mdi-account-multiple-plus</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Prospectos</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            </template>
          <span>Lista de prospectos provenientes de redes, página web, etc.</span>
        </v-tooltip>
        </div>

        <!-- Ventas y Cobranza -->
        <div v-show="permissions('sales')||permissions('collections')">
        <v-divider class="ma-4"></v-divider>
        <v-expansion-panels class="sinsombra">
          <v-expansion-panel style="background:transparent!important;">
            <v-expansion-panel-header style="font-weight:500; font-size:0.8125rem; color:#202020; padding:0px!important;">
              <div>
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-currency-usd</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Ventas y Cobranza</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Lista de gastos</span>
                </v-tooltip>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
          
                <!-- cotizaciones -->
                <div v-show="permissions('quotations')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item v-bind="attrs" v-on="on" to="/quotations" link >
                      <v-list-item-action class="mr-3">
                        <v-icon>  mdi-file-outline</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Cotizaciones</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </template>
                  <span>Prospectos de venta</span>
                </v-tooltip>
                </div>

                <!-- ventas -->
                <!--div v-show="permissions('sales')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item to="/sales" link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-currency-usd</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Ventas</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Lista de ventas cerradas</span>
                </v-tooltip>
                </div-->

                <!-- ventas -->
                <div v-show="permissions('sales')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item to="/new-sales" link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-currency-usd</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Ventas <!--v-chip class="ml-2" x-small color="primary">BETA</v-chip--></v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Lista de ventas cerradas</span>
                </v-tooltip>
                </div>
                <!-- cobranza -->
                <!--div v-show="permissions('collections')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item to="/collections" link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-cash-plus</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Cobranza</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Lista de cobranzas</span>
                </v-tooltip>
                </div-->
                <!-- cobranza 2 -->
                <div v-show="permissions('collections')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item to="/new-collections" link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-cash-plus</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Cobranza<!--v-chip x-small class="ml-2" color="primary">BETA</v-chip--></v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Lista de cobranzas</span>
                </v-tooltip>
                </div>
                <!-- saldos vencidos -->
                <div v-show="permissions('balances')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item to="/balances" link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-account-clock-outline</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Saldos Vencidos</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Lista de clientes con adeudos vencidos</span>
                </v-tooltip>
                </div>
                <!-- cancelaciones -->
                <div v-show="permissions('cancelations')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item to="/canceled" link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-close-circle-outline</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Cancelaciones</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Cotizaciones que no se cerraron por algun motivo</span>
                </v-tooltip>
                </div>

                

                <!-- cancelaciones -->
                <div v-show="permissions('ferreteria')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item to="/ferreteria" link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-tools</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Mostrador</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Remisiones y Facturas MACRO</span>
                </v-tooltip>
                </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        </div>

        


        <!-- Ventas y Cobranza -->
        <div v-show="permissions('shippings') || permissions('orders')">
        <v-divider class="ma-4"></v-divider>
        <v-expansion-panels class="sinsombra">
          <v-expansion-panel style="background:transparent!important;">
            <v-expansion-panel-header style="font-weight:500; font-size:0.8125rem; color:#202020; padding:0px!important;">
              <div>
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-map-marker-path</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Logistica</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span></span>
                </v-tooltip>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
          
                

                <!-- envios -->
                <div v-show="permissions('orders')">
                  <v-tooltip right open-delay="1000">
                    <template v-slot:activator="{ on, attrs }">
                      <v-list-item to="/orders" link v-bind="attrs" v-on="on">
                        <v-list-item-action class="mr-3">
                          <v-icon>mdi-package-variant</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                          <v-list-item-title>Pedidos x Surtir</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      </template>
                    <span>Lista de pedidos por surtir</span>
                  </v-tooltip>
                </div>

                <div v-show="permissions('orders_ready')">
                  <v-tooltip right open-delay="1000">
                    <template v-slot:activator="{ on, attrs }">
                      <v-list-item to="/orders-ready" link v-bind="attrs" v-on="on">
                        <v-list-item-action class="mr-3">
                          <v-icon>mdi-package-variant-closed</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                          <v-list-item-title>Pedidos Surtidos</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      </template>
                    <span>Lista de pedidos surtidos</span>
                  </v-tooltip>
                </div>

                <!-- envios -->
                <div v-show="permissions('shippings')">
                  <v-tooltip right open-delay="1000">
                    <template v-slot:activator="{ on, attrs }">
                      <v-list-item to="/shippings" link v-bind="attrs" v-on="on">
                        <v-list-item-action class="mr-3">
                          <v-icon>mdi-truck-delivery-outline</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                          <v-list-item-title>Envios</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      </template>
                    <span>Lista de rutas de envio con detalle</span>
                  </v-tooltip>
                </div>

            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        </div>






        <!-- Gastos -->
        <div v-show="permissions('expenses')">
          <v-divider class="ma-4"></v-divider>
          <v-tooltip right open-delay="1000">
            <template v-slot:activator="{ on, attrs }">
              <v-list-item to="/expenses" link v-bind="attrs" v-on="on">
                <v-list-item-action class="mr-3">
                  <v-icon>mdi-currency-usd-off</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Gastos</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              </template>
            <span>Lista de gastos</span>
          </v-tooltip>
        </div>

        <!-- Compras -->
        <div v-show="permissions('shoppings')">
        <v-divider class="ma-4"></v-divider>
        <v-expansion-panels class="sinsombra">
          <v-expansion-panel style="background:transparent!important;">
            <v-expansion-panel-header style="font-weight:500; font-size:0.8125rem; color:#202020; padding:0px!important;">
              <div v-show="permissions('shoppings')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-cart-outline</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Compras</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de compras realizadas</span>
              </v-tooltip>
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <div v-show="permissions('shoppings')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/shopping" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-cart-outline</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Compras</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de compras realizadas</span>
              </v-tooltip>
              </div>
              <!-- Proveedores -->
              <div v-show="permissions('providers')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/providers" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-account-multiple</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Proveedores</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de proveedores</span>
              </v-tooltip>
              </div>

              <!-- Pagos Proveedores -->
              <div v-show="permissions('provider_payments')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/provider-payments" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-cash-check</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Pagos Proveedores</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de pagos a proveedores</span>
              </v-tooltip>
              </div>
              
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        </div>

        <!-- Producción-->
        <div v-show="permissions('productions')">
          <v-divider class="ma-4"></v-divider>
          <v-tooltip right open-delay="1000">
            <template v-slot:activator="{ on, attrs }">
              <v-list-item to="/production" link v-bind="attrs" v-on="on">
                <v-list-item-action class="mr-3">
                  <v-icon>mdi-account-network</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Producción</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              </template>
            <span>Lista de producciones</span>
          </v-tooltip>
        </div>

        <!-- Productos -->
        <v-divider class="ma-4"></v-divider>
        <v-tooltip right open-delay="1000">
          <template v-slot:activator="{ on, attrs }">
            <v-list-item to="/products" link v-bind="attrs" v-on="on">
              <v-list-item-action class="mr-3">
                <v-icon>mdi-palette-swatch</v-icon>
              </v-list-item-action>
              <v-list-item-content>
                <v-list-item-title>Catálogo de Productos</v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            </template>
          <span>Catálogo de Productos para Vendedores</span>
        </v-tooltip>
              

        <!-- Inventario -->
        <div v-show="permissions('inventory')">
        <v-divider class="ma-4"></v-divider>
        <v-expansion-panels class="sinsombra">
          <v-expansion-panel style="background:transparent!important;">
            <v-expansion-panel-header style="font-weight:500; font-size:0.8125rem; color:#202020; padding:0px!important;">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-format-list-bulleted</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Inventario</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de Productos e Insumos</span>
              </v-tooltip>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/inventary" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-format-list-bulleted</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Inventario</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de Productos e Insumos</span>
              </v-tooltip>

              <!-- Materia Prima -->
              <div v-show="permissions('raw_material')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item to="/raw-material" link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-apps</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Materia Prima</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Lista de materiales que componen los productos</span>
                </v-tooltip>
              </div>

              <!-- Ajustes -->
              <div v-show="permissions('adjustments')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/adjustments" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-tools</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Ajustes</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de ajustes a insumos</span>
              </v-tooltip>
              </div>

              <!-- Inventario Físico -->
              <div v-show="permissions('physical_inventories')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/physical-inventory" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-clipboard-check-outline</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Inventario Físico</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de ajustes a productos</span>
              </v-tooltip>
              </div>

              <!-- Costos de Productos >
              <div v-show="permissions('item_cost')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/costs" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-currency-usd</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Costos de Productos</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista para modificar costos de productos</span>
              </v-tooltip>
              </div-->

              <!-- Reporte de Inventario-->
              <div v-show="permissions('report_inventory')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/inventory-reports" v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-transit-connection-horizontal</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Movimientos</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Tabla de movimientos de inventario</span>
              </v-tooltip>
              </div>
            
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        </div>

        <!-- administracion -->
        <div v-show="permissions('pay_rolls') || permissions('utilities')">
        <v-divider class="ma-4"></v-divider>
        <v-expansion-panels class="sinsombra">
          <v-expansion-panel style="background:transparent!important;">
            <v-expansion-panel-header style="font-weight:500; font-size:0.8125rem; color:#202020;" class="px-4 py-0">
              <div>
                <v-icon class="mr-2">mdi-file-document-multiple-outline</v-icon> 
                Administración
              </div>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <!-- Nominas -->
              <div v-show="permissions('pay_rolls')">
                <v-tooltip right open-delay="1000">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item to="/payroll" link v-bind="attrs" v-on="on">
                      <v-list-item-action class="mr-3">
                        <v-icon>mdi-account-cash-outline</v-icon>
                      </v-list-item-action>
                      <v-list-item-content>
                        <v-list-item-title>Nominas</v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                    </template>
                  <span>Lista de nominas</span>
                </v-tooltip>
              </div>
              <!-- utilidades -->
              <div v-show="permissions('utilities')">
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/utilities" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-cash-plus</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Utilidades<v-chip x-small class="ml-2" color="primary">BETA</v-chip></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Lista de productos vendidos por ventas, comparativa entre costos y precios</span>
              </v-tooltip>
              </div>
              <!-- corte de resultados >
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/results" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-content-cut</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Corte de Resultados</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Corte de Resultados</span>
              </v-tooltip-->
              <!-- Meses >
              <v-tooltip right open-delay="1000">
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item to="/months" link v-bind="attrs" v-on="on">
                    <v-list-item-action class="mr-3">
                      <v-icon>mdi-calendar-check</v-icon>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title>Meses</v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  </template>
                <span>Meses</span>
              </v-tooltip-->
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
        </div>

        <!-- bitacora -->
        <div v-show="permissions('activityLog')">
          <v-divider class="ma-4"></v-divider>
          <v-tooltip right open-delay="1000">
            <template v-slot:activator="{ on, attrs }">
              <v-list-item to="/activity-log" link v-bind="attrs" v-on="on">
                <v-list-item-action class="mr-3">
                  <v-icon>mdi-clipboard-text</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Bitacoras</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              </template>
            <span>Registro de altas y cambios</span>
          </v-tooltip>
        </div>

      </v-list>
      <template v-slot:append>
        <div style="color:#9ca3a5; font-size: 12px;" class="pa-2">
          UNOCRM | v4.1.44 <v-icon> mdi-settings</v-icon>
        </div>
      </template>
    </v-navigation-drawer>
    <!-- header -->
    <v-app-bar class="elevation-0 px-0" :clipped-left="$vuetify.breakpoint.lgAndUp" app  color="#f4f5fa" dark><!-- box-shadow: 0px 0px 5px 0px rgb(112 112 115 / 30%)!important; -->
        <v-icon @click.stop="drawer = !drawer"  v-if="currentUser.name!='Felix'" class="mr-5" color="grey"> mdi-menu</v-icon>
        <img style="height: 30px;" src="https://unocrm.mx/wp-content/uploads/2020/08/unocrm_logo-1.svg">
        <v-spacer></v-spacer>  
        <!-- search bar -->
        <!--v-text-field label="Search here for reports analytics and help" prepend-icon="mdi-magnify" rounded light class="hidden-sm-and-down mt-6"></v-text-field-->
        <!-- home button -->
        <v-btn class="hidden-sm-and-down pa-0" icon to="/" link>
          <v-icon color="#707073">mdi-apps</v-icon>
        </v-btn>
        <!-- notification button -->
        <v-menu v-if="currentUser.name!='Felix'" bottom left offset-y origin="top right" transition="scale-transition">
          <template v-slot:activator="{ attrs, on }">
            <v-btn icon class="ml-2 mr-1" min-width="0" text v-bind="attrs" v-on="on">
              <v-badge overlap color="#e25104">
                <template v-slot:badge>
                  {{notes.length}}
                </template>
                <v-icon color="#707073">mdi-bell</v-icon>
              </v-badge>
            </v-btn>
          </template>
          <!-- dropdown notification -->
          <v-list dense>
            <v-list-item-group color="primary">
              <v-list-item to="/notes" link>
                <v-list-item-action>
                  <v-icon> mdi-clipboard-text</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Notas ({{notes.length}})</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
        <!-- account button -->
        <v-menu bottom left offset-y origin="top right" transition="scale-transition">
          <template v-slot:activator="{ attrs, on }">
            <v-btn class="ml-2 mr-1" text v-bind="attrs" v-on="on">
                <v-avatar size="32px">
                  <img :src="liga + 'files/'+currentUser.avatar" >
                </v-avatar>
                <span class="hidden-sm-and-down" style="color:#707073; margin-left:10px; text-transform: initial; letter-spacing: 0px; font-size:16px; font-weight: 400;"> {{currentUser.name}} {{currentUser.last}}</span> <v-icon color="#707073">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <!-- dropdown account -->
          <v-list dense>
            <v-list-item-group color="primary">
              <v-list-item link to="/settings" v-if="currentUser.name!='Felix'">
                <v-list-item-action>
                  <v-icon> mdi-cog</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Ajustes</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-list-item link @click="logout">
                <v-list-item-action>
                  <v-icon>mdi-power</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title>Cerrar Sesión</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              
            </v-list-item-group>
          </v-list>
        </v-menu>
        <!--div v-if="drawer==true" @click.stop="drawer = !drawer" style="box-shadow: rgba(112, 112, 115, 0.3) 0px 0px 5px 0px !important; transition-duration: 0.2s; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); will-change: all; transition-property: all; position:absolute; margin-left:229px; margin-top:50vh; width:24px; background:#f4f5fa; padding:50px 0px; border-radius:0px 30px 30px 0px; left:-15px; cursor: pointer;">
          <v-icon color="#e25104"> mdi-chevron-left</v-icon>
        </div>
        <div v-else @click.stop="drawer = !drawer" style="box-shadow: rgba(112, 112, 115, 0.3) 0px 0px 5px 0px !important; transition-duration: 0.2s; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); will-change: all; transition-property: all; position:absolute; margin-top:50vh; width:24px; background:#f4f5fa; padding:50px 0px; border-radius:0px 30px 30px 0px; left:-16px; cursor: pointer;">
          <v-icon color="#e25104"> mdi-chevron-right</v-icon>
        </div-->
    </v-app-bar>
    <!-- content -->
    <v-main style="background-color:#f4f5fa;" class="pt-0" v-if="currentUser.name=='Felix'">
      <felix/>
    </v-main>
    <v-main v-else class="pa-0" style="background-color:#f4f5fa;">
      <v-container class="pa-0" fluid>
          <router-view @closeDrawer="closeDrawer"></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<!----------------------- Scripts ----------------------->
<script>
import Felix from "../components/orders/container"
  export default {
    name: 'AppContainer',
    data: () => ({
      drawer: true,
      attrs: {
        class: 'mb-6',
        boilerplate: true,
        elevation: 2,
      },
    }),
    methods:{
      closeDrawer: function(params) {
        this.drawer = params;
      },
      logout(){
        this.$store.dispatch('currentUser/logoutUser')
      },
      permissions(permission){
        if(this.currentUser.id==1){
          return true
        }else if(this.currentUser.permissions!=undefined){
          if(this.currentUser.permissions.includes(permission)){
            return true
          }else{
            return false
          }
        }else{
          return false
        }
      },      
    },
    computed:{
      liga(){
        return process.env.VUE_APP_BACKEND_ROUTE
      },
      notes(){
        return this.$store.state.note.notes.filter(note=>note.seen == false);
      },
      currentUser:{
        get(){
          return this.$store.state.currentUser.user;
        }
      }
    },
    created(){
      this.$store.dispatch('user/getUsers') 
      this.$store.dispatch('currentUser/getUser')
      //this.$store.dispatch('payroll/getPayrolls')

      this.$store.dispatch('type/getTypes')
      this.$store.dispatch('cfdi/getCfdi')
      this.$store.dispatch('frequency/getFrequencies')
      this.$store.dispatch('contact_mode/getContactModes')
      this.$store.dispatch('special_condition/getSpecialConditions')
      this.$store.dispatch('activity/getActivities') 
      this.$store.dispatch('origin/getOrigins')
      this.$store.dispatch('status/getStatuses')
      this.$store.dispatch('phase/getPhases')
      this.$store.dispatch('price_list/getPriceLists')
      this.$store.dispatch('payment_method/getPaymentMethods')
      this.$store.dispatch('unit/getUnits')
      this.$store.dispatch('vehicle/getVehicles')

      this.$store.dispatch('company/getCompanies')
      this.$store.dispatch('lead/getLeads')
      this.$store.dispatch('contact/getContacts') 
      
      this.$store.dispatch('category/getCategories')
      this.$store.dispatch('item/getItems')
      
      this.$store.dispatch('rejection/getRejections')
      this.$store.dispatch('quotation/getQuotations')
      this.$store.dispatch('quotation/getOnlyQuotations')
      this.$store.dispatch('quotation/getQuotationItems')
      
      
      //this.$store.dispatch('shipping/getShippings')
      //this.$store.dispatch('shipping_detail/getShippingDetails')

      this.$store.dispatch('expense/getExpenses')
      this.$store.dispatch('expense_type/getExpenseTypes')

      this.$store.dispatch('shopping/getShoppings')
      this.$store.dispatch('shopping_detail/getShoppingDetails')
      this.$store.dispatch('provider_payment/getProviderPayments')
      this.$store.dispatch('provider/getProviders')

      this.$store.dispatch('production/getProductions')
      this.$store.dispatch('production_detail/getProductionDetails')
      //this.$store.dispatch('adjustment/getAdjustments')
      this.$store.dispatch('inventory/getInventories')
      
      this.$store.dispatch('collection/getCollectionDetails')
      this.$store.dispatch('collection/getCollections')
      this.$store.dispatch('raw_material/getRawMaterial')
    },
    components:{ 
      'felix':Felix
    },
  }
</script>


<!-- Styles -->      
<style>
  .v-navigation-drawer__border{
    display:none!important;
  }
  .sidebar .v-list-item.v-list-item--link.theme--light:hover{
    background-color:#e9edf8!important; 
    border-radius: 0px 20px 20px 0px!important;
  }
  .sidebar .v-list-item.v-list-item--link.theme--light:hover i::before{
    color: #1f88fe!important;
  }
  .sidebar .v-list-item--active{
    background-color:#e9edf8!important; 
    border-radius: 0px 20px 20px 0px!important;
  }
  .sidebar .v-list-item--active i::before{
    color: #1f88fe!important;
  }
  .sidebar .theme--light.v-list-item--active:hover::before, .theme--light.v-list-item--active::before {
    opacity: 0!important;
  }
  .sidebar .theme--light.v-list-item:hover::before {
    opacity: 0;
  }
  .v-window__prev, .v-window__next {
    background: transparent!important;;
  }
  .v-carousel__controls{
    display:none!important;
  }
  .v-application--wrap {
    min-height: calc(100vh - 65px)!important;
  }
  .sinsombra .v-expansion-panel::before{
    box-shadow: none!important;
  }
</style>