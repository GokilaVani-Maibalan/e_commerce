# e_commerce

**=>** **User** :
           1. User can signup & view all products.
**=>** **Staff** :
           1. Staff account is created by admin.
           2. Vendors can be assigned to staff.
           3. Staff can add products to vendors assigned to them.
           4. Staff can view all products.
**=>** **Vendor** :
           1. Vendor can signup an account.
           2. Vendor can create products and view them.
**=>** **Admin** :
           1. Admin can signup an account.
           2. Admin only can create & assign vendors to Staff.
           3. Admin only has access to update staff account.
           4. Admin can view all the members &  can delete staff.
           5. Admin can also create products.

**=>** This project needs an .env file in the project root directory with the below details :
          ``1. PORT (server port)
            2. HOST (localhost)
            3. USER (sql user name)
            4. PASSWORD (sql password)
            5. DB_NAME (database name)
            6. JWT_SECRET (jwt secret key)``

