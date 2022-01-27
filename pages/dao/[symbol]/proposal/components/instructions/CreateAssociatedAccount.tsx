/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useContext, useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  CreateAssociatedAccountForm,
} from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from '../../new'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletStore from 'stores/useWalletStore'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import Select from '@components/inputs/Select'
import {
  ProgramAccount,
  serializeInstructionToBase64,
  Governance,
} from '@solana/spl-governance'
import GovernedAccountSelect from '../GovernedAccountSelect'
import { createAssociatedTokenAccount } from '@utils/associated'
import { TOKEN_ACCOUNT_MINTS } from '@utils/tokenAccounts'

function getTokenAccountMintByName(nameToMatch: string): PublicKey {
  const item = Object.entries(TOKEN_ACCOUNT_MINTS).find(
    ([_, { name }]) => name === nameToMatch
  )

  if (!item) {
    throw new Error('must be here')
  }

  const [, { mint }] = item

  return mint
}

const CreateAssociatedAccount = ({
  index,
  governance,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
}) => {
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { realmInfo } = useRealm()
  const [governedAccounts, setGovernedAccounts] = useState<
    GovernedMultiTypeAccount[]
  >([])
  const {
    governancesArray,
    governedTokenAccounts,
    getMintWithGovernances,
  } = useGovernanceAssets()

  useEffect(() => {
    async function prepGovernances() {
      const mintWithGovernances = await getMintWithGovernances()

      const matchedGovernances = governancesArray.map((gov) => {
        const governedTokenAccount = governedTokenAccounts.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        if (governedTokenAccount) {
          return governedTokenAccount as GovernedMultiTypeAccount
        }

        const mintGovernance = mintWithGovernances.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        if (mintGovernance) {
          return mintGovernance as GovernedMultiTypeAccount
        }

        return {
          governance: gov,
        }
      })

      setGovernedAccounts(matchedGovernances)
    }

    prepGovernances()
  }, [])

  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<CreateAssociatedAccountForm>({})
  const [formErrors, setFormErrors] = useState({})
  const { handleSetInstructions } = useContext(NewProposalContext)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)
    setFormErrors(validationErrors)
    return isValid
  }

  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction()

    if (
      !connection ||
      !isValid ||
      !programId ||
      !form.governedAccount?.governance?.account ||
      !form.splTokenMintName ||
      !wallet?.publicKey
    ) {
      return {
        serializedInstruction: '',
        isValid: false,
        governance: form.governedAccount?.governance,
      }
    }

    const [tx] = await createAssociatedTokenAccount(
      // fundingAddress
      new PublicKey(wallet.publicKey.toBase58()),

      // walletAddress
      form.governedAccount.governance.pubkey,

      // splTokenMintAddress
      getTokenAccountMintByName(form.splTokenMintName)
    )

    console.log('infos', {
      governanceAccount: form.governedAccount.governance.account,
      governanceOwner: form.governedAccount.governance.owner.toString(),
      fundingAddress: wallet.publicKey.toString(),
      walletAddress: form.governedAccount.governance.pubkey.toString(),
      splTokenMintName: form.splTokenMintName,
      splTokenMintAddress: getTokenAccountMintByName(
        form.splTokenMintName
      ).toString(),
    })

    console.log('tx', tx)

    return {
      serializedInstruction: serializeInstructionToBase64(tx),
      isValid: true,
      governance: form.governedAccount.governance,
    }
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
    splTokenMintName: yup.string().required('SPL Token Mint is required'),
  })

  return (
    <>
      <GovernedAccountSelect
        label="Governance"
        governedAccounts={governedAccounts as GovernedMultiTypeAccount[]}
        onChange={(value) => {
          handleSetForm({ value, propertyName: 'governedAccount' })
        }}
        value={form.governedAccount}
        error={formErrors['governedAccount']}
        shouldBeGoverned={shouldBeGoverned}
        governance={governance}
      ></GovernedAccountSelect>

      <Select
        label="SPL Token Mint"
        value={form.splTokenMintName}
        placeholder="Please select..."
        onChange={(value) =>
          handleSetForm({ value, propertyName: 'splTokenMintName' })
        }
        error={formErrors['baseTokenName']}
      >
        {Object.entries(TOKEN_ACCOUNT_MINTS).map(([key, { name, mint }]) => (
          <Select.Option key={key} value={name}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>{name}</span>

              <span style={{ color: 'grey', fontSize: '0.8em' }}>
                {mint.toString()}
              </span>
            </div>
          </Select.Option>
        ))}
      </Select>
    </>
  )
}

export default CreateAssociatedAccount
