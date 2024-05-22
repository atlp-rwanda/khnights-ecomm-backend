import { Transaction } from '../../entities/transaction';
import { Cart } from '../../entities/Cart';
import { CartItem } from '../../entities/CartItem';
import { Order } from '../../entities/Order';
import { OrderItem } from '../../entities/OrderItem';
import { wishList } from '../../entities/wishList';
import { getConnection } from 'typeorm';
import { Product } from '../../entities/Product';
import { Category } from '../../entities/Category';
import { Coupon } from '../../entities/coupon';
import { User } from '../../entities/User';
import { server } from '../..';
import { VendorOrderItem } from '../../entities/VendorOrderItem';
import { VendorOrders } from '../../entities/vendorOrders';

export const cleanDatabase = async () => {
  const connection = getConnection();

  // Delete from child tables first
  await connection.getRepository(Transaction).delete({});
  await connection.getRepository(Coupon).delete({});
  await connection.getRepository(VendorOrderItem).delete({});
  await connection.getRepository(VendorOrders).delete({});
  await connection.getRepository(OrderItem).delete({});
  await connection.getRepository(Order).delete({});
  await connection.getRepository(CartItem).delete({});
  await connection.getRepository(Cart).delete({});
  await connection.getRepository(wishList).delete({});

  // Many-to-Many relations
  // Clear junction table entries before deleting products and categories
  await connection.createQueryRunner().query('DELETE FROM product_categories_category');

  await connection.getRepository(Product).delete({});
  await connection.getRepository(Category).delete({});

  // Coupons (if related to Orders or Users)

  // Finally, delete from parent table
  await connection.getRepository(User).delete({});

  await connection.close();
};

// // Execute the clean-up function
// cleanDatabase().then(() => {
//   console.log('Database cleaned');
// }).catch(error => {
//   console.error('Error cleaning database:', error);
// });
