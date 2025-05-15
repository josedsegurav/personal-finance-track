

export default function Purchasestbody (props) {

    const {filteredPurchases} = props;
    return(
        <>
           <tbody>
              {filteredPurchases &&
                filteredPurchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b border-gray-100">
                    <td className="py-4 px-6 text-paynes-gray">
                      {purchase.purchase_date}
                    </td>
                    <td className="py-4 px-6 text-paynes-gray">
                      {purchase.item}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-3 py-1 text-xs font-medium">
                        {purchase.categories.category_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-bittersweet bg-opacity-10 text-bittersweet rounded-full px-3 py-1 text-xs font-medium">
                        {purchase.stores.store_name}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-paynes-gray">
                      ${purchase.amount}
                    </td>
                    <td className="py-4 px-6 text-right text-paynes-gray">
                      ${parseInt(purchase.taxes) * parseFloat(purchase.amount)}
                    </td>
                    <td className="py-4 px-6 text-right font-medium text-bittersweet">
                      $
                      {parseFloat(purchase.amount) +
                        parseInt(purchase.taxes) * parseFloat(purchase.amount)}
                    </td>
                  </tr>
                ))}
            </tbody>
        </>
    )
}